import { sanitizeHtml } from './sanitize-html';

test('keeps the formatting tags AniList actually uses', () => {
  expect(sanitizeHtml('A <b>bold</b> and <i>italic</i> line.<br>Next.')).toBe(
    'A <b>bold</b> and <i>italic</i> line.<br>Next.',
  );
});

test('drops a script tag and its contents', () => {
  expect(sanitizeHtml('Before<script>alert(1)</script>After')).not.toContain('alert');
});

test('strips event handlers while keeping the text', () => {
  const out = sanitizeHtml('<img src=x onerror="steal(localStorage.token)">caption');
  expect(out).not.toContain('onerror');
  expect(out).not.toContain('<img');
  expect(out).toContain('caption');
});

test('unwraps disallowed tags rather than deleting the words inside', () => {
  expect(sanitizeHtml('see <a href="javascript:alert(1)">this link</a>')).toBe(
    'see this link',
  );
});

test('strips attributes from tags it keeps', () => {
  expect(sanitizeHtml('<b style="position:fixed" onclick="x()">hi</b>')).toBe('<b>hi</b>');
});

test('handles nesting', () => {
  expect(sanitizeHtml('<div><b>kept <span>inner</span></b></div>')).toBe('<b>kept inner</b>');
});
