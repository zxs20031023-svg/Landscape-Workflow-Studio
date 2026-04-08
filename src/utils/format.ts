export function formatPercent(value: number, fractionDigits = 0): string {
  return `${(value * 100).toFixed(fractionDigits)}%`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('zh-CN').format(value);
}

export function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value));
}

export function formatRelativePath(workflowType: string, projectName: string) {
  const safe = projectName.replace(/\s+/g, '_');
  return workflowType === 'design_brief'
    ? `artifacts/digital-briefs/${safe}.json`
    : `artifacts/history/${safe}.json`;
}

export function safeJsonStringify(value: unknown): string {
  return JSON.stringify(value, null, 2);
}
