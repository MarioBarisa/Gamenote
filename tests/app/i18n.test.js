import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { createAppI18n, languages, resolveLocale } from '../../src/i18n/index.js';

test('jezik preglednika i spremljeni odabir određuju jezik sučelja', () => {
  assert.equal(resolveLocale('hr'), 'hr');
  assert.equal(resolveLocale('hr-HR'), 'hr');
  assert.equal(resolveLocale('hr-BA'), 'hr');
  assert.equal(resolveLocale('de-DE'), 'en');
  assert.equal(resolveLocale(undefined), 'en');
  assert.equal(resolveLocale('hr-HR', 'en'), 'en');
  assert.equal(resolveLocale('en-US', 'hr'), 'hr');
  assert.equal(resolveLocale('hr-HR', 'invalid'), 'hr');
});

test('svaki registrirani jezik prevodi iste ključeve s istim parametrima', context => {
  context.mock.method(console, 'error', message => assert.fail(String(message)));
  const english = languages.find(language => language.code === 'en').messages;

  for (const { code, messages } of languages) {
    const { t } = createAppI18n(code).global;
    assert.deepEqual(Object.keys(messages).sort(), Object.keys(english).sort(), code);

    for (const group of Object.keys(english)) {
      assert.deepEqual(Object.keys(messages[group]).sort(), Object.keys(english[group]).sort(), code + '.' + group);
      for (const [key, reference] of Object.entries(english[group])) {
        const path = group + '.' + key;
        const label = code + '.' + path;
        const message = messages[group][key];
        assert.ok(message.trim(), label);
        const tokens = value => [...new Set(value.match(/\{\w+\}/g))].sort();
        const parameters = tokens(reference);
        assert.deepEqual(tokens(message), parameters, label);

        const names = parameters.map(token => token.slice(1, -1));
        const values = names.every(name => /^\d+$/.test(name)) ? [] : {};
        for (const name of names) values[name] = 'fixture-' + name;
        const translated = t(path, values);
        assert.ok(translated && translated !== path, label);
        for (const name of names) assert.ok(translated.includes(values[name]), label);
      }
    }
  }
});

test('ključevi koje koristi aplikacija postoje u svim katalozima', () => {
  const source = new URL('../../src/', import.meta.url);
  for (const file of readdirSync(source, { recursive: true })) {
    if (!/\.(?:js|vue)$/.test(file)) continue;
    const contents = readFileSync(new URL(file, source), 'utf8');
    for (const [, , key] of contents.matchAll(/(?:\$t|\bt)\(\s*(['"])([\w.]+)\1/g)) {
      const [group, message] = key.split('.');
      for (const language of languages) {
        assert.equal(typeof language.messages[group]?.[message], 'string', file + ': ' + language.code + '.' + key);
      }
    }
  }
});

test('promjena jezika ponovo prevodi isti ključ', () => {
  const { locale, t } = createAppI18n('en').global;
  assert.equal(t('language.label'), 'Language');
  locale.value = 'hr';
  assert.equal(t('language.label'), 'Jezik');
});
