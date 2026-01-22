export function personalizePrompt(template: string, state: { brand: string; website: string; industry: string; challenge: string }): string {
  return template
    .replace(/\{\{BRAND\}\}/g, state.brand || '[Brand]')
    .replace(/\{\{WEBSITE\}\}/g, state.website || '[Website]')
    .replace(/\{\{INDUSTRY\}\}/g, state.industry || '[Industry]')
    .replace(/\{\{CHALLENGE\}\}/g, state.challenge || '[Challenge]');
}

export function simpleMarkdown(text: string): string {
  return text
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/^\- (.*$)/gim, '<li>$1</li>')
    .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');
}
