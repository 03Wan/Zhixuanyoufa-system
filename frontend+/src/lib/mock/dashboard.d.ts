export declare const dashboardMock: {
    metrics: {
        todayTaskCount: number;
        pendingReviewCount: number;
        highRiskCount: number;
        reportCount: number;
    };
    highRiskTasks: {
        id: string;
        taskNo: string;
        productName: string;
        platform: string;
        market: string;
        riskLevel: string;
        decision: string;
    }[];
    recentTasks: {
        id: string;
        taskNo: string;
        productName: string;
        platform: string;
        market: string;
        status: string;
        createdAt: string;
    }[];
    recentReports: {
        id: string;
        reportNo: string;
        taskName: string;
        totalScore: number;
        riskLevel: string;
        createdAt: string;
    }[];
};
