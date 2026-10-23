export interface DisplayOption {
  option: string;
  originalIndex: number;
}

/** The server shuffles once per delivery and keeps the answer key private.
 * Never shuffle this list again: doing so would undo the no-repeat rule.
 */
export function getDisplayOptions(question: {
  options: string[];
  option_indices?: number[];
}): DisplayOption[] {
  const mapping = question.option_indices;
  if (
    question.options.length !== 5 ||
    !mapping || mapping.length !== 5 ||
    new Set(mapping).size !== 5 ||
    mapping.some((index) => !Number.isInteger(index) || index < 0 || index > 4)
  ) {
    throw new Error('Mapeamento das alternativas inválido. Reabra a prova.');
  }
  return question.options.map((option, position) => ({
    option,
    originalIndex: mapping[position],
  }));
}
