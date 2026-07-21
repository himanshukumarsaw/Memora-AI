const { classifyDocument, extractFields, generateSummary, ragChat } = require('../services/ai.service');

describe('AI Pipeline Unit Tests (11_Testing_Strategy.md §10, §11, §12)', () => {
  it('should correctly classify a Passport document', async () => {
    const text = 'REPUBLIC OF INDIA PASSPORT P123456 HIMS';
    const result = await classifyDocument(text);
    expect(result.documentType).toBe('Passport');
    expect(result.category).toBe('identity');
  });

  it('should correctly classify a PAN Card document', async () => {
    const text = 'INCOME TAX DEPARTMENT GOVT OF INDIA PERMANENT ACCOUNT NUMBER PAN ABCDE1234F';
    const result = await classifyDocument(text);
    expect(result.documentType).toBe('PAN Card');
    expect(result.category).toBe('financial');
  });

  it('should extract name, dob, and ID number from raw text', async () => {
    const text = 'Name: Himanshu Kumar DOB: 12/05/2004 ID Number: P9876543';
    const fields = await extractFields(text, 'Passport');
    expect(fields.name).toBe('Himanshu Kumar');
    expect(fields.dob).toBe('12/05/2004');
    expect(fields.idNumber).toBe('P9876543');
  });

  it('should handle RAG Chat responses with grounded document context', async () => {
    const docs = [
      { documentType: 'Passport', aiSummary: 'Passport belonging to Himanshu, expires in 2030', extractedData: { expiryDate: '12/05/2030' } }
    ];
    const answer = await ragChat('When does my passport expire?', docs);
    expect(answer).toContain('2030');
  });
});
