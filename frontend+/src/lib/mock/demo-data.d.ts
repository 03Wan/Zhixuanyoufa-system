export declare const demoData: {
    user: {
        id: string;
        username: string;
        email: string;
        companyName: string;
        role: string;
    };
    tasks: {
        id: string;
        productName: string;
        category: string;
        platform: string;
        market: string;
        purpose: string;
        status: string;
        createdAt: string;
        updatedAt: string;
    }[];
    detectionResult: {
        score: number;
        detectedAt: string;
        riskLevel: string;
        decision: string;
        reviewStatus: string;
        dimensionScores: {
            completeness: number;
            compliance: number;
            attractiveness: number;
            localization: number;
            riskControl: number;
        };
        matchedRules: {
            name: string;
            type: string;
            riskLevel: string;
            position: string;
            description: string;
            suggestion: string;
        }[];
        issues: {
            position: string;
            type: string;
            riskLevel: string;
            hitContent: string;
            description: string;
        }[];
        suggestions: {
            target: string;
            problem: string;
            before: string;
            after: string;
            reason: string;
            suggestion: string;
        }[];
    };
    reports: {
        id: string;
        taskId: string;
        reportNo: string;
        title: string;
        summary: string;
        result: {
            score: number;
            riskLevel: string;
            decision: string;
            detectedAt: string;
            dimensionScores: {
                completeness: number;
                compliance: number;
                attractiveness: number;
                localization: number;
                riskControl: number;
            };
            matchedRules: {
                name: string;
                type: string;
                riskLevel: string;
                position: string;
                description: string;
                suggestion: string;
            }[];
            issues: {
                position: string;
                riskLevel: string;
                description: string;
            }[];
            suggestions: {
                before: string;
                after: string;
                reason: string;
            }[];
            reviewStatus: string;
            reviewOpinion: string;
        };
        logs: {
            time: string;
            action: string;
            operator: string;
            note: string;
        }[];
        createdAt: string;
        updatedAt: string;
        task: {
            id: string;
            taskNo: string;
            productName: string;
            sku: string;
            platform: string;
            market: string;
            category: string;
            purpose: string;
        };
    }[];
    rules: {
        id: string;
        name: string;
        type: string;
        platform: string;
        market: string;
        category: string;
        riskLevel: string;
        keywords: string[];
        suggestion: string;
        enabled: boolean;
        createdAt: string;
        updatedAt: string;
    }[];
};
