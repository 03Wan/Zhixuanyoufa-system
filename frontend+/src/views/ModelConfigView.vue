<template>
  <AppShell title="模型配置">
    <section class="page-stack fade-up">
      <AppGlassSurface as="section" class="card block">
        <div class="row-between header-row">
          <div class="title-block">
            <h2 class="section-title">大模型服务配置</h2>
            <p class="text-muted">
              先选择供应商预设，再点击“验证连接”确认地址与 Key 可用，最后再保存配置。
            </p>
          </div>
          <div class="actions">
            <button class="btn btn-secondary" :disabled="loading" @click="load">刷新</button>
            <button class="btn btn-secondary" :disabled="testing || loading" @click="testConnection">
              {{ testing ? '验证中...' : '验证连接' }}
            </button>
            <button class="btn btn-primary" :disabled="saving || loading" @click="save">
              {{ saving ? '保存中...' : '保存配置' }}
            </button>
          </div>
        </div>

        <div class="preset-grid">
          <button
            v-for="item in providerPresets"
            :key="item.key"
            type="button"
            class="preset-card hover-lift"
            :class="{ active: form.provider === item.provider }"
            @click="applyPreset(item)"
          >
            <div class="preset-top">
              <strong>{{ item.label }}</strong>
              <span>{{ item.modelName || '使用供应商当前可用模型' }}</span>
            </div>
            <small>{{ item.note }}</small>
          </button>
        </div>

        <div class="form-grid">
          <div class="field">
            <label>供应商</label>
            <select v-model="form.provider" class="input" @change="syncPresetByProvider">
              <option v-for="item in providerOptions" :key="item.provider" :value="item.provider">
                {{ item.label }}
              </option>
            </select>
          </div>

          <div class="field">
            <label class="inline-check">
              <input type="checkbox" v-model="form.enabled" />
              启用服务端模型配置
            </label>
          </div>

          <div class="field">
            <label>API URL</label>
            <input class="input" v-model.trim="form.apiUrl" placeholder="https://api.xxx.com/v1/..." />
          </div>

          <div class="field">
            <label>API Key</label>
            <input
              class="input"
              v-model.trim="form.apiKey"
              :placeholder="hasApiKey ? '留空则保留当前密钥' : '填写后会加密保存'"
            />
          </div>

          <div class="field">
            <label>模型名称（可选）</label>
            <input class="input" v-model.trim="form.modelName" placeholder="留空使用系统推荐模型；需要固定版本时再填写" />
          </div>
        </div>

        <div v-if="hasApiKey" class="state success glass-state">
          当前账号已保存 API Key。验证连接时会优先使用当前表单里的密钥。
        </div>

        <div v-if="testResult" class="state glass-state" :class="testResult.success ? 'success' : 'error'">
          <strong>{{ testResult.message }}</strong>
          <span>状态码：{{ testResult.statusCode || '-' }}</span>
          <span>延迟：{{ testResult.latencyMs }} ms</span>
          <span v-if="testResult.responsePreview">返回预览：{{ testResult.responsePreview }}</span>
        </div>
      </AppGlassSurface>
    </section>
  </AppShell>
</template>

<script setup lang="ts">
import AppGlassSurface from '@/components/AppGlassSurface.vue';
import AppShell from '@/layouts/AppShell.vue';
import { api, getFriendlyError, type ModelConnectionTestResult } from '@/lib/api';
import { notify, toast } from '@/lib/dialog';
import { onMounted, reactive, ref } from 'vue';

type ProviderPreset = {
  key: string;
  provider: string;
  label: string;
  apiUrl: string;
  modelName: string;
  note: string;
};

const providerPresets: ProviderPreset[] = [
  {
    key: 'openai',
    provider: 'OPENAI_COMPATIBLE',
    label: 'ChatGPT / OpenAI',
    apiUrl: 'https://api.openai.com/v1/chat/completions',
    modelName: '',
    note: '自动使用当前可用的 OpenAI 推荐模型',
  },
  {
    key: 'anthropic',
    provider: 'ANTHROPIC',
    label: 'Claude',
    apiUrl: 'https://api.anthropic.com/v1/messages',
    modelName: '',
    note: 'Anthropic Messages API',
  },
  {
    key: 'gemini',
    provider: 'GOOGLE_GEMINI',
    label: 'Gemini',
    apiUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
    modelName: '',
    note: 'Google Gemini REST 接口',
  },
  {
    key: 'deepseek',
    provider: 'DEEPSEEK',
    label: 'DeepSeek',
    apiUrl: 'https://api.deepseek.com/chat/completions',
    modelName: '',
    note: 'OpenAI 兼容接口',
  },
  {
    key: 'kimi',
    provider: 'KIMI',
    label: 'Kimi',
    apiUrl: 'https://api.moonshot.cn/v1/chat/completions',
    modelName: '',
    note: 'Moonshot OpenAI 兼容接口',
  },
  {
    key: 'minimax',
    provider: 'MINIMAX',
    label: 'MiniMax',
    apiUrl: 'https://api.minimaxi.com/v1/chat/completions',
    modelName: '',
    note: 'MiniMax OpenAI 兼容接口',
  },
  { key: 'qwen', provider: 'QWEN', label: '通义千问 / Qwen', apiUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', modelName: '', note: 'OpenAI 兼容接口；可按账户填写模型标识' },
  { key: 'zhipu', provider: 'ZHIPU', label: '智谱 AI', apiUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions', modelName: '', note: 'OpenAI 兼容接口；可按账户填写模型标识' },
  { key: 'groq', provider: 'GROQ', label: 'Groq', apiUrl: 'https://api.groq.com/openai/v1/chat/completions', modelName: '', note: 'OpenAI 兼容接口；可按账户填写模型标识' },
  { key: 'mistral', provider: 'MISTRAL', label: 'Mistral AI', apiUrl: 'https://api.mistral.ai/v1/chat/completions', modelName: '', note: 'OpenAI 兼容接口；可按账户填写模型标识' },
  { key: 'openrouter', provider: 'OPENROUTER', label: 'OpenRouter', apiUrl: 'https://openrouter.ai/api/v1/chat/completions', modelName: '', note: '多模型路由；请按账户填写模型标识' },
  { key: 'custom', provider: 'CUSTOM', label: '自定义供应商', apiUrl: '', modelName: '', note: '手动填写兼容 API 地址、模型标识和密钥' },
];

const providerOptions = providerPresets;

const form = reactive({
  enabled: false,
  apiUrl: '',
  apiKey: '',
  modelName: '',
  provider: 'OPENAI_COMPATIBLE',
});

const loading = ref(false);
const saving = ref(false);
const testing = ref(false);
const hasApiKey = ref(false);
const testResult = ref<ModelConnectionTestResult | null>(null);

function applyPreset(preset: ProviderPreset) {
  form.provider = preset.provider;
  form.apiUrl = preset.apiUrl;
  form.modelName = preset.modelName;
  testResult.value = null;
}

function syncPresetByProvider() {
  const preset = providerPresets.find((item) => item.provider === form.provider);
  if (!preset) return;
  form.apiUrl = preset.apiUrl;
  form.modelName = preset.modelName;
  testResult.value = null;
}

async function load() {
  loading.value = true;
  try {
    const data: any = await api.getModelConfig();
    form.enabled = !!data.enabled;
    form.apiUrl = String(data.apiUrl || '');
    form.apiKey = '';
    // Presets intentionally do not expose pinned model IDs in the workspace.
    form.modelName = '';
    form.provider = String(data.provider || 'OPENAI_COMPATIBLE');
    hasApiKey.value = !!data.hasApiKey;
    testResult.value = null;
  } catch (error) {
    await notify(getFriendlyError(error));
  } finally {
    loading.value = false;
  }
}

async function save() {
  saving.value = true;
  try {
    const data: any = await api.saveModelConfig({
      enabled: form.enabled,
      apiUrl: form.apiUrl,
      apiKey: form.apiKey,
      modelName: form.modelName,
      provider: form.provider,
    });
    hasApiKey.value = !!data.hasApiKey;
    form.apiKey = '';
    toast('模型配置已保存');
  } catch (error) {
    await notify(getFriendlyError(error));
  } finally {
    saving.value = false;
  }
}

async function testConnection() {
  testing.value = true;
  try {
    const data = (await api.testModelConfig({
      apiUrl: form.apiUrl,
      apiKey: form.apiKey,
      modelName: form.modelName,
      provider: form.provider,
    })) as ModelConnectionTestResult;
    testResult.value = data;
    toast(data.message, data.success ? 'success' : 'error');
  } catch (error) {
    const message = getFriendlyError(error);
    testResult.value = {
      success: false,
      provider: form.provider,
      apiUrl: form.apiUrl,
      modelName: form.modelName,
      statusCode: 0,
      latencyMs: 0,
      message,
      responsePreview: '',
    };
    toast(message, 'error');
  } finally {
    testing.value = false;
  }
}

onMounted(load);
</script>

<style scoped>
.block {
  display: grid;
  gap: 14px;
}

.header-row {
  gap: 12px;
  align-items: start;
}

.title-block {
  display: grid;
  gap: 6px;
}

.actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.preset-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.preset-card {
  border: 1px solid color-mix(in srgb, var(--glass-border) 80%, transparent);
  border-radius: 16px;
  padding: 14px;
  text-align: left;
  color: inherit;
  cursor: pointer;
  display: grid;
  gap: 8px;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.54), rgba(255, 255, 255, 0.12)),
    var(--card-strong);
  box-shadow: var(--glass-shadow-soft), var(--inner-glow);
  backdrop-filter: blur(10px) saturate(110%);
  -webkit-backdrop-filter: blur(10px) saturate(110%);
}

.preset-top {
  display: grid;
  gap: 4px;
}

.preset-card strong {
  font-size: 15px;
}

.preset-card span {
  color: var(--brand-1);
  font-weight: 700;
}

.preset-card small {
  color: var(--muted);
  line-height: 1.5;
}

.preset-card.active {
  border-color: var(--brand-1);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--brand-1) 20%, transparent), var(--glass-shadow-soft), var(--inner-glow);
  transform: translateY(-1px);
}

.form-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.field {
  display: grid;
  gap: 6px;
}

.field label {
  font-weight: 700;
}

.inline-check {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.glass-state {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.56), rgba(255, 255, 255, 0.16)), var(--card-strong);
  box-shadow: var(--glass-shadow-soft), var(--inner-glow);
  backdrop-filter: blur(8px) saturate(110%);
  -webkit-backdrop-filter: blur(8px) saturate(110%);
}

.state.success {
  border-color: rgba(16, 185, 129, 0.32);
  color: #047857;
}

.state.error {
  border-color: rgba(239, 68, 68, 0.32);
  color: #b91c1c;
}

@media (max-width: 1100px) {
  .preset-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .preset-grid,
  .form-grid {
    grid-template-columns: 1fr;
  }

  .actions {
    justify-content: stretch;
  }

  .actions .btn {
    width: 100%;
  }
}
</style>
