import {XMLParser} from 'fast-xml-parser';

export function parseFaceMatchResponse(xml: string) {
  const parser = new XMLParser();
  const json = parser.parse(xml);

  const response = json.localFaceMatchResponse || {};

  return {
    status: response.status,
    score: Number(response.score || 0),
    message: response.message || '',
  };
}
