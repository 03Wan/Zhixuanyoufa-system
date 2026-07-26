import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type ModelProvider =
  | 'OPENAI_COMPATIBLE'
  | 'DEEPSEEK'
  | 'KIMI'
  | 'MINIMAX'
  | 'ANTHROPIC'
  | 'GOOGLE_GEMINI'
  | 'QWEN'
  | 'ZHIPU'
  | 'GROQ'
  | 'MISTRAL'
  | 'OPENROUTER'
  | 'CUSTOM';

type ModelMessage = { role: 'system' | 'user' | 'assistant'; content: string };

type InvokeModelInput = {
  provider?: string;
  apiUrl: string;
  apiKey: string;
  modelName: string;
  messages: ModelMessage[];
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
};

type InvokeModelResult = {
  ok: boolean;
  provider: string;
  apiUrl: string;
  modelName: string;
  statusCode: number;
  latencyMs: number;
  text: string;
  preview: string;
};

@Injectable()
export class ModelConfigService {
  constructor(private readonly prisma: PrismaService) {}

  private encryptionKey() {
    const seed = process.env.CONFIG_ENCRYPTION_KEY?.trim();
    if (!seed) {
      throw new BadRequestException('模型配置加密密钥未配置，请联系系统管理员');
    }
    return createHash('sha256').update(seed).digest();
  }

  private encrypt(value: string) {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.encryptionKey(), iv);
    const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return [iv.toString('base64'), authTag.toString('base64'), encrypted.toString('base64')].join('.');
  }

  private decrypt(value?: string | null) {
    if (!value) return '';
    const [ivB64, tagB64, encryptedB64] = value.split('.');
    if (!ivB64 || !tagB64 || !encryptedB64) return '';
    const decipher = createDecipheriv('aes-256-gcm', this.encryptionKey(), Buffer.from(ivB64, 'base64'));
    decipher.setAuthTag(Buffer.from(tagB64, 'base64'));
    const decrypted = Buffer.concat([decipher.update(Buffer.from(encryptedB64, 'base64')), decipher.final()]);
    return decrypted.toString('utf8');
  }

  private normalizeProvider(provider?: string): ModelProvider {
    const value = String(provider || 'OPENAI_COMPATIBLE').trim().toUpperCase();
    if (value === 'CLAUDE') return 'ANTHROPIC';
    if (value === 'GEMINI') return 'GOOGLE_GEMINI';
    if (value === 'OPENAI') return 'OPENAI_COMPATIBLE';
    if (
      value === 'OPENAI_COMPATIBLE' ||
      value === 'DEEPSEEK' ||
      value === 'KIMI' ||
      value === 'MINIMAX' ||
      value === 'ANTHROPIC' ||
      value === 'GOOGLE_GEMINI' ||
      value === 'QWEN' ||
      value === 'ZHIPU' ||
      value === 'GROQ' ||
      value === 'MISTRAL' ||
      value === 'OPENROUTER' ||
      value === 'CUSTOM'
    ) {
      return value;
    }
    return 'OPENAI_COMPATIBLE';
  }

  private async currentUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, email: true },
    });
    if (!user) throw new NotFoundException('用户不存在');
    return user;
  }

  private openAiCompatibleBody(messages: ModelMessage[], modelName: string, temperature?: number, maxTokens?: number) {
    const payload: Record<string, any> = {
      model: modelName,
      messages,
    };
    if (temperature !== undefined) payload.temperature = temperature;
    if (maxTokens !== undefined) payload.max_tokens = maxTokens;
    return payload;
  }

  private anthropicBody(messages: ModelMessage[], modelName: string, temperature?: number, maxTokens?: number) {
    const system = messages.filter((item) => item.role === 'system').map((item) => item.content).join('\n\n').trim();
    const conversation = messages.filter((item) => item.role !== 'system');
    const payload: Record<string, any> = {
      model: modelName,
      messages: conversation,
      max_tokens: maxTokens ?? 64,
    };
    if (system) payload.system = system;
    if (temperature !== undefined) payload.temperature = temperature;
    return payload;
  }

  private geminiBody(messages: ModelMessage[], temperature?: number, maxTokens?: number) {
    const system = messages.filter((item) => item.role === 'system').map((item) => item.content).join('\n\n').trim();
    const contents = messages
      .filter((item) => item.role !== 'system')
      .map((item) => ({
        role: item.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: item.content }],
      }));
    const payload: Record<string, any> = { contents };
    if (system) payload.systemInstruction = { parts: [{ text: system }] };
    payload.generationConfig = {
      temperature: temperature ?? 0,
      maxOutputTokens: maxTokens ?? 64,
    };
    return payload;
  }

  private buildRequest(input: InvokeModelInput) {
    const provider = this.normalizeProvider(input.provider);
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const messages = input.messages || [];

    if (provider === 'ANTHROPIC') {
      headers['x-api-key'] = input.apiKey;
      headers['anthropic-version'] = '2023-06-01';
      return {
        provider,
        url: input.apiUrl,
        headers,
        body: JSON.stringify(this.anthropicBody(messages, input.modelName, input.temperature, input.maxTokens)),
      };
    }

    if (provider === 'GOOGLE_GEMINI') {
      headers['x-goog-api-key'] = input.apiKey;
      return {
        provider,
        url: input.apiUrl,
        headers,
        body: JSON.stringify(this.geminiBody(messages, input.temperature, input.maxTokens)),
      };
    }

    headers.Authorization = `Bearer ${input.apiKey}`;
    return {
      provider,
      url: input.apiUrl,
      headers,
      body: JSON.stringify(this.openAiCompatibleBody(messages, input.modelName, input.temperature, input.maxTokens)),
    };
  }

  private extractText(provider: string, raw: any) {
    if (provider === 'ANTHROPIC') {
      const blocks = Array.isArray(raw?.content) ? raw.content : [];
      const text = blocks
        .map((item: any) => {
          if (typeof item?.text === 'string') return item.text;
          if (typeof item === 'string') return item;
          return '';
        })
        .join('');
      return text || String(raw?.output_text || '');
    }

    if (provider === 'GOOGLE_GEMINI') {
      const candidate = raw?.candidates?.[0];
      const parts = Array.isArray(candidate?.content?.parts) ? candidate.content.parts : [];
      const text = parts
        .map((item: any) => (typeof item?.text === 'string' ? item.text : ''))
        .join('');
      return text || String(raw?.text || '');
    }

    const choice = raw?.choices?.[0]?.message?.content;
    if (typeof choice === 'string') return choice;
    if (Array.isArray(choice)) {
      return choice
        .map((item: any) => {
          if (typeof item?.text === 'string') return item.text;
          if (typeof item === 'string') return item;
          return '';
        })
        .join('');
    }
    const outputText = raw?.output?.[0]?.content?.[0]?.text;
    if (typeof outputText === 'string') return outputText;
    return '';
  }

  async invokeModel(input: InvokeModelInput): Promise<InvokeModelResult> {
    const apiUrl = input.apiUrl.trim();
    const apiKey = input.apiKey.trim();
    const modelName = input.modelName.trim() || 'gpt-5.6';
    const provider = this.normalizeProvider(input.provider);

    if (!apiUrl) throw new BadRequestException('请先填写 API URL');
    if (!apiKey) throw new BadRequestException('请先填写 API Key');

    const startedAt = Date.now();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), input.timeoutMs ?? 12_000);

    try {
      const request = this.buildRequest({
        ...input,
        provider,
        apiUrl,
        apiKey,
        modelName,
      });

      const response = await fetch(request.url, {
        method: 'POST',
        headers: request.headers,
        body: request.body,
        signal: controller.signal,
      });

      const latencyMs = Date.now() - startedAt;
      const text = await response.text();

      return {
        ok: response.ok,
        provider,
        apiUrl,
        modelName,
        statusCode: response.status,
        latencyMs,
        text,
        preview: text.slice(0, 240),
      };
    } finally {
      clearTimeout(timer);
    }
  }

  async getPublicConfig(userId: string) {
    await this.currentUser(userId);
    const item = await this.prisma.modelConfig.findUnique({ where: { ownerUserId: userId } });
    return {
      enabled: !!item?.enabled,
      provider: item?.provider || 'OPENAI_COMPATIBLE',
      apiUrl: item?.apiUrl || '',
      modelName: item?.modelName || '',
      hasApiKey: !!item?.apiKeyCiphertext,
      maskedApiKey: item?.apiKeyCiphertext ? '已保存' : '',
    };
  }

  async saveConfig(
    userId: string,
    body: { enabled?: boolean; apiUrl?: string; apiKey?: string; modelName?: string; provider?: string },
  ) {
    await this.currentUser(userId);
    const existing = await this.prisma.modelConfig.findUnique({ where: { ownerUserId: userId } });
    const apiKeyCiphertext =
      body.apiKey === undefined
        ? existing?.apiKeyCiphertext || null
        : body.apiKey.trim()
          ? this.encrypt(body.apiKey.trim())
          : null;
    const provider = this.normalizeProvider(body.provider);

    await this.prisma.modelConfig.upsert({
      where: { ownerUserId: userId },
      update: {
        ...(body.enabled !== undefined ? { enabled: !!body.enabled } : {}),
        ...(body.apiUrl !== undefined ? { apiUrl: body.apiUrl.trim() || null } : {}),
        ...(body.modelName !== undefined ? { modelName: body.modelName.trim() || null } : {}),
        ...(body.provider !== undefined ? { provider } : {}),
        apiKeyCiphertext,
      },
      create: {
        ownerUserId: userId,
        enabled: !!body.enabled,
        provider,
        apiUrl: body.apiUrl?.trim() || null,
        apiKeyCiphertext,
        modelName: body.modelName?.trim() || 'gpt-5.6',
      },
    });

    return this.getPublicConfig(userId);
  }

  async testConnection(
    userId: string,
    body: { apiUrl?: string; apiKey?: string; modelName?: string; provider?: string },
  ) {
    await this.currentUser(userId);

    const existing = await this.prisma.modelConfig.findUnique({ where: { ownerUserId: userId } });
    const provider = this.normalizeProvider(body.provider);
    const apiUrl = body.apiUrl?.trim() || existing?.apiUrl || '';
    const apiKey = body.apiKey?.trim() || this.decrypt(existing?.apiKeyCiphertext) || '';
    const modelName = body.modelName?.trim() || existing?.modelName || 'gpt-5.6';

    try {
      const result = await this.invokeModel({
        provider,
        apiUrl,
        apiKey,
        modelName,
        messages: [{ role: 'user', content: 'ping' }],
        temperature: 0,
        maxTokens: 1,
        timeoutMs: 8_000,
      });

      return {
        success: result.ok,
        provider: result.provider,
        apiUrl: result.apiUrl,
        modelName: result.modelName,
        statusCode: result.statusCode,
        latencyMs: result.latencyMs,
        message: result.ok
          ? '连接成功'
          : result.statusCode === 401 || result.statusCode === 403
            ? 'API 可达，但鉴权失败，请检查 API Key'
            : result.statusCode === 404
              ? 'API 可达，但接口地址可能不正确'
              : `连接失败，HTTP ${result.statusCode}`,
        responsePreview: result.preview,
      };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      const isTimeout = error instanceof Error && /aborted|timeout/i.test(error.message);
      return {
        success: false,
        provider,
        apiUrl,
        modelName,
        statusCode: 0,
        latencyMs: isTimeout ? 8_000 : 0,
        message: isTimeout ? '网络请求超时，请检查接口地址或稍后重试' : '网络服务错误，请检查接口地址、网络连通性或服务状态',
        responsePreview: error instanceof Error ? error.message.slice(0, 240) : '',
      };
    }
  }

  async getRuntimeConfig(userId: string) {
    await this.currentUser(userId);
    const item = await this.prisma.modelConfig.findUnique({ where: { ownerUserId: userId } });
    if (!item?.enabled || !item.apiUrl || !item.apiKeyCiphertext) return null;
    return {
      enabled: item.enabled,
      provider: this.normalizeProvider(item.provider),
      apiUrl: item.apiUrl,
      apiKey: this.decrypt(item.apiKeyCiphertext),
      modelName: item.modelName || 'gpt-5.6',
    };
  }

  extractResponseText(provider: string, raw: any) {
    return this.extractText(this.normalizeProvider(provider), raw);
  }
}
