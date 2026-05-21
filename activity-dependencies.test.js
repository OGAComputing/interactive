import { describe, expect, test } from 'vitest';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const ACTIVITY_ROOTS = ['Y8', 'Y9', 'Y11', 'Y13', 'Other'];
const EXEMPTION_PATTERN = /^\s*(?:shared-dependencies|sharedDependencies)\s*:\s*exempt\b/i;
const REASON_PATTERN = /^\s*(?:shared-dependencies-reason|sharedDependenciesReason)\s*:\s*\S+/i;

function findHtmlFiles(dir) {
  if (!existsSync(dir)) return [];

  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const filePath = path.join(dir, entry.name);
    if (entry.isDirectory()) return findHtmlFiles(filePath);
    return entry.isFile() && entry.name.toLowerCase().endsWith('.html') ? [filePath] : [];
  });
}

function hasScript(html, scriptName) {
  const pattern = new RegExp(`<script\\b[^>]*\\bsrc=["'][^"']*${scriptName}["'][^>]*>`, 'i');
  return pattern.test(html);
}

function dependencyExemption(html) {
  const topMatter = html.split(/\r?\n/).slice(0, 20);
  const hasExemption = topMatter.some(line => EXEMPTION_PATTERN.test(line));
  if (!hasExemption) return { exempt: false, valid: true };

  return {
    exempt: true,
    valid: topMatter.some(line => REASON_PATTERN.test(line))
  };
}

describe('activity shared dependencies', () => {
  test('every non-exempt activity HTML loads ActivityUI and Classroom', () => {
    const htmlFiles = ACTIVITY_ROOTS.flatMap(findHtmlFiles);
    const missing = [];
    const invalidExemptions = [];

    for (const file of htmlFiles) {
      const html = readFileSync(file, 'utf8');
      const exemption = dependencyExemption(html);
      if (exemption.exempt) {
        if (!exemption.valid) {
          invalidExemptions.push(`${file}: add shared-dependencies-reason metadata`);
        }
        continue;
      }

      const missingScripts = [];

      if (!hasScript(html, 'activity-ui\\.js')) missingScripts.push('activity-ui.js');
      if (!hasScript(html, 'classroom\\.js')) missingScripts.push('classroom.js');

      if (missingScripts.length) {
        missing.push(`${file}: ${missingScripts.join(', ')}`);
      }
    }

    expect(invalidExemptions, invalidExemptions.join('\n')).toEqual([]);
    expect(missing, missing.join('\n')).toEqual([]);
  });
});
