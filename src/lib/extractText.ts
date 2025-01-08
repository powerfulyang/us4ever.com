/**
 * Extracts main text information recursively from a JSON structure.
 * @param node - A node of the JSON structure.
 * @param result - An array to accumulate text data.
 */
export function extractText(node: any, result: string[] = []): string[] {
  // Extract text from the current node's data
  if (node.data.text) {
    result.push(node.data.text)
  }
  if (node.data.note) {
    result.push(node.data.note)
  }

  // Recursively process children nodes
  if (node.children && node.children.length > 0) {
    for (const child of node.children) {
      extractText(child, result)
    }
  }

  return result
}
