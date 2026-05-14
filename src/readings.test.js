import { describe, it, expect } from 'vitest';
import {
  parseReadingsXml,
  formatDate,
  formatISO,
  parseISO,
  addDays,
  clampDate,
  minDate,
  maxDate,
  isSameDay,
} from './readings';

// A weekday: First Reading, Psalm, Gospel — no Second Reading, has a reflection.
const weekdayXml = `<?xml version="1.0" encoding="UTF-8"?>
<data-set><evangelizo>
<saint><![CDATA[]]></saint>
<litugic_t><![CDATA[Friday of the Seventh week of Easter]]></litugic_t>
<reading_text1_lt><![CDATA[Acts of the Apostles 25,13-21.]]></reading_text1_lt>
<reading_text1_st><![CDATA[Acts 25,13-21.]]></reading_text1_st>
<reading_text1><![CDATA[First reading text.]]></reading_text1>
<reading_text2_st><![CDATA[Ps 103(102),1-2.11-12.]]></reading_text2_st>
<reading_text2><![CDATA[Psalm text.]]></reading_text2>
<reading_text3_st><![CDATA[ ]]></reading_text3_st>
<reading_text3><![CDATA[]]></reading_text3>
<reading_gospel_st><![CDATA[John 21,15-19.]]></reading_gospel_st>
<reading_gospel><![CDATA[Gospel text.]]></reading_gospel>
<comment_t><![CDATA[On love]]></comment_t>
<comment_a><![CDATA[St. Someone]]></comment_a>
<comment_s><![CDATA[A homily]]></comment_s>
<comment><![CDATA[Reflection body.]]></comment>
</evangelizo></data-set>`;

// A Sunday/solemnity: all four readings, no reflection block.
const sundayXml = `<?xml version="1.0" encoding="UTF-8"?>
<data-set><evangelizo>
<litugic_t><![CDATA[Pentecost Sunday - Solemnity]]></litugic_t>
<reading_text1_st><![CDATA[Acts 2,1-11.]]></reading_text1_st>
<reading_text1><![CDATA[First reading.]]></reading_text1>
<reading_text2_st><![CDATA[Ps 104(103).]]></reading_text2_st>
<reading_text2><![CDATA[Psalm.]]></reading_text2>
<reading_text3_st><![CDATA[1 Corinthians 12,3b-7.12-13.]]></reading_text3_st>
<reading_text3><![CDATA[Second reading.]]></reading_text3>
<reading_gospel_st><![CDATA[John 20,19-23.]]></reading_gospel_st>
<reading_gospel><![CDATA[Gospel.]]></reading_gospel>
</evangelizo></data-set>`;

// What the feed returns for an out-of-window date: an HTML error page.
const errorHtml =
  '<!DOCTYPE html><html><body><font color=red><b>Error</b></font></body></html>';

describe('parseReadingsXml', () => {
  it('parses a weekday with no Second Reading', () => {
    const r = parseReadingsXml(weekdayXml);
    expect(r.liturgicalTitle).toBe('Friday of the Seventh week of Easter');
    expect(r.saint).toBe('');
    expect(r.readings.map((x) => x.slot)).toEqual([
      'First Reading',
      'Responsorial Psalm',
      'Gospel',
    ]);
    expect(r.readings[0].title).toBe('Acts 25,13-21.');
    expect(r.readings[0].text).toBe('First reading text.');
    expect(r.reflection).toEqual({
      title: 'On love',
      author: 'St. Someone',
      source: 'A homily',
      text: 'Reflection body.',
    });
  });

  it('parses a Sunday with a Second Reading and no reflection', () => {
    const r = parseReadingsXml(sundayXml);
    expect(r.readings.map((x) => x.slot)).toEqual([
      'First Reading',
      'Responsorial Psalm',
      'Second Reading',
      'Gospel',
    ]);
    expect(r.reflection).toBeNull();
  });

  it('throws on an HTML error page', () => {
    expect(() => parseReadingsXml(errorHtml)).toThrow();
  });
});

describe('date helpers', () => {
  it('formatDate produces YYYYMMDD', () => {
    expect(formatDate(new Date(2026, 4, 14))).toBe('20260514');
  });

  it('formatISO produces YYYY-MM-DD', () => {
    expect(formatISO(new Date(2026, 4, 14))).toBe('2026-05-14');
  });

  it('parseISO round-trips with formatISO', () => {
    expect(formatISO(parseISO('2026-05-14'))).toBe('2026-05-14');
  });

  it('addDays crosses month boundaries', () => {
    expect(formatDate(addDays(new Date(2026, 4, 31), 1))).toBe('20260601');
  });

  it('clampDate keeps dates within the ±30 day window', () => {
    expect(clampDate(addDays(maxDate(), 10)).getTime()).toBe(maxDate().getTime());
    expect(clampDate(addDays(minDate(), -10)).getTime()).toBe(minDate().getTime());
    const inside = addDays(minDate(), 5);
    expect(clampDate(inside).getTime()).toBe(inside.getTime());
  });

  it('isSameDay ignores time of day', () => {
    const a = new Date(2026, 4, 14, 9, 30);
    const b = new Date(2026, 4, 14, 23, 0);
    expect(isSameDay(a, b)).toBe(true);
    expect(isSameDay(a, addDays(a, 1))).toBe(false);
  });
});
