/**
 * Static data model for document conversion use cases
 */
export const useCases = [
  {
    id: 'textual-summary',
    name: 'Textual Summaries',
    description: 'Convert documents into concise text summaries',
    icon: '📄',
    recommendedFormats: ['text', 'markdown', 'pdf', 'docx']
  },
  {
    id: 'data-analysis',
    name: 'Data Analysis',
    description: 'Extract and transform data for analytical purposes',
    icon: '📊',
    recommendedFormats: ['csv', 'excel', 'json']
  },
  {
    id: 'presentation',
    name: 'Presentation Materials',
    description: 'Convert documents into presentation-ready formats',
    icon: '🖼️',
    recommendedFormats: ['pptx', 'pdf', 'html']
  },
  {
    id: 'legal-review',
    name: 'Legal Review',
    description: 'Format documents for legal review and annotation',
    icon: '⚖️',
    recommendedFormats: ['pdf', 'docx', 'text']
  }
];