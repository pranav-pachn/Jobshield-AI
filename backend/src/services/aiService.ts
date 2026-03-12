export async function analyzeJobText(input: string) {
  return {
    score: 0,
    risk: "unknown",
    summary: `AI analysis placeholder for input length ${input.length}`,
  };
}
