const { generateTag, pad } = require('./tag-generator');

describe('pad', () => {
  test('pads single digit numbers', () => {
    expect(pad(5)).toBe('05');
    expect(pad(0)).toBe('00');
    expect(pad(9)).toBe('09');
  });

  test('does not pad double digit numbers', () => {
    expect(pad(10)).toBe('10');
    expect(pad(99)).toBe('99');
  });
});

describe('generateTag', () => {
  const testDate = new Date('2024-04-26T14:30:45Z');
  const testSha = 'e4f36cb1e382e2779d3609c1336bdbe7cfb0902c';

  test('generates default format correctly', () => {
    const tag = generateTag(testDate, testSha, '{YYYY}{MM}{DD}-{HH}{mm}{ss}-{sha:7}');
    expect(tag).toBe('20240426-143045-e4f36cb');
  });

  test('handles 4-digit year', () => {
    const tag = generateTag(testDate, testSha, '{YYYY}');
    expect(tag).toBe('2024');
  });

  test('handles 2-digit year', () => {
    const tag = generateTag(testDate, testSha, '{YY}');
    expect(tag).toBe('24');
  });

  test('handles padded month', () => {
    const tag = generateTag(testDate, testSha, '{MM}');
    expect(tag).toBe('04');
  });

  test('handles unpadded month', () => {
    const tag = generateTag(testDate, testSha, '{M}');
    expect(tag).toBe('4');
  });

  test('handles padded day', () => {
    const tag = generateTag(testDate, testSha, '{DD}');
    expect(tag).toBe('26');
  });

  test('handles unpadded day', () => {
    const januaryDate = new Date('2024-04-05T14:30:45Z');
    const tag = generateTag(januaryDate, testSha, '{D}');
    expect(tag).toBe('5');
  });

  test('handles padded hour', () => {
    const tag = generateTag(testDate, testSha, '{HH}');
    expect(tag).toBe('14');
  });

  test('handles unpadded hour', () => {
    const morningDate = new Date('2024-04-26T08:30:45Z');
    const tag = generateTag(morningDate, testSha, '{H}');
    expect(tag).toBe('8');
  });

  test('handles padded minute', () => {
    const tag = generateTag(testDate, testSha, '{mm}');
    expect(tag).toBe('30');
  });

  test('handles unpadded minute', () => {
    const earlyMinute = new Date('2024-04-26T14:04:45Z');
    const tag = generateTag(earlyMinute, testSha, '{m}');
    expect(tag).toBe('4');
  });

  test('handles padded second', () => {
    const tag = generateTag(testDate, testSha, '{ss}');
    expect(tag).toBe('45');
  });

  test('handles unpadded second', () => {
    const earlySecond = new Date('2024-04-26T14:30:05Z');
    const tag = generateTag(earlySecond, testSha, '{s}');
    expect(tag).toBe('5');
  });

  test('handles full SHA', () => {
    const tag = generateTag(testDate, testSha, '{sha}');
    expect(tag).toBe(testSha);
  });

  test('handles custom length SHA', () => {
    const tag = generateTag(testDate, testSha, '{sha:8}');
    expect(tag).toBe('e4f36cb1');
  });

  test('handles multiple SHA placeholders', () => {
    const tag = generateTag(testDate, testSha, '{sha:7}-{sha:7}');
    expect(tag).toBe('e4f36cb-e4f36cb');
  });

  test('handles semver format', () => {
    const tag = generateTag(testDate, testSha, '{YYYY}.{M}.{D}');
    expect(tag).toBe('2024.4.26');
  });

  test('handles custom format with v prefix', () => {
    const tag = generateTag(testDate, testSha, 'v{YYYY}.{MM}.{DD}-{sha:7}');
    expect(tag).toBe('v2024.04.26-e4f36cb');
  });

  test('handles compact format', () => {
    const tag = generateTag(testDate, testSha, '{YY}{MM}{DD}-{HH}{mm}-{sha:6}');
    expect(tag).toBe('240426-1430-e4f36c');
  });

  test('handles repeated tokens', () => {
    const tag = generateTag(testDate, testSha, '{DD}{DD}');
    expect(tag).toBe('2626');
  });

  test('handles mixed format', () => {
    const tag = generateTag(testDate, testSha, 'release-{YYYY}{MM}{DD}{HH}{mm}');
    expect(tag).toBe('release-202404261430');
  });
});
