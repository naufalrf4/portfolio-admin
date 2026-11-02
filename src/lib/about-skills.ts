export interface AboutSkill {
  name: string;
  level: number;
  category: string;
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

export function normalizeSkillCategory(skill: string): string {
  const normalized = skill.toLowerCase();

  if (
    normalized.includes('react') ||
    normalized.includes('next') ||
    normalized.includes('tailwind') ||
    normalized.includes('typescript') ||
    normalized.includes('javascript')
  ) {
    return 'Web Development';
  }

  if (
    normalized.includes('postgres') ||
    normalized.includes('mysql') ||
    normalized.includes('supabase')
  ) {
    return 'Data & Backend';
  }

  if (normalized.includes('iot') || normalized.includes('esp32') || normalized.includes('mqtt')) {
    return 'IoT Systems';
  }

  if (
    normalized.includes('rag') ||
    normalized.includes('ai') ||
    normalized.includes('langchain') ||
    normalized.includes('openai')
  ) {
    return 'AI & Automation';
  }

  if (normalized.includes('docker') || normalized.includes('bash') || normalized.includes('aws')) {
    return 'Cloud & DevOps';
  }

  return 'Tools & Workflow';
}

export function normalizeAboutSkills(value: unknown): AboutSkill[] {
  const parsed = Array.isArray(value) ? value : [];

  return parsed.flatMap((skill) => {
    if (typeof skill === 'string') {
      const name = asString(skill);
      if (!name) return [];

      return [{ name, level: 85, category: normalizeSkillCategory(name) }];
    }

    if (typeof skill === 'object' && skill !== null) {
      const raw = skill as Record<string, unknown>;
      const name = asString(raw.name);
      if (!name) return [];

      const rawLevel = typeof raw.level === 'number' ? raw.level : 85;
      const level = Number.isFinite(rawLevel)
        ? Math.max(0, Math.min(100, Math.round(rawLevel)))
        : 85;
      const category = asString(raw.category) ?? normalizeSkillCategory(name);

      return [{ name, level, category }];
    }

    return [];
  });
}
