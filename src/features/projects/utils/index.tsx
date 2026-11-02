import { Globe, Smartphone, Server, Cloud, Code2 } from 'lucide-react';

export function getCategoryIcon(category: string) {
  const lowerCategory = category.toLowerCase();
  if (lowerCategory.includes('web')) {
    return <Globe className="h-5 w-5" />;
  } else if (lowerCategory.includes('mobile')) {
    return <Smartphone className="h-5 w-5" />;
  } else if (lowerCategory.includes('backend') || lowerCategory.includes('api')) {
    return <Server className="h-5 w-5" />;
  } else if (lowerCategory.includes('devops') || lowerCategory.includes('infrastructure')) {
    return <Cloud className="h-5 w-5" />;
  }
  return <Code2 className="h-5 w-5" />;
}

export function formatTechStack(
  techStack: string[],
  maxVisible: number
): {
  visible: string[];
  remaining: number;
} {
  return {
    visible: techStack.slice(0, maxVisible),
    remaining: Math.max(0, techStack.length - maxVisible),
  };
}
