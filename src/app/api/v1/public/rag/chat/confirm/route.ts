import type { NextRequest } from 'next/server';
import { proxyRagChatRequest } from '@/lib/services/rag-chat-proxy';

export async function POST(request: NextRequest) {
  return proxyRagChatRequest(request, 'chat/confirm');
}
