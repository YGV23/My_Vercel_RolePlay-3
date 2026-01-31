import { supabase } from './supabaseClient';
import { Character, ChatSession, Message, AppSettings } from '../types';

export const dataService = {
  // Characters
  async saveCharacter(userId: string, character: Character): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from('characters')
        .upsert({
          id: character.id,
          user_id: userId,
          name: character.name,
          tagline: character.tagline,
          description: character.description,
          appearance: character.appearance,
          personality: character.personality,
          firstMessage: character.firstMessage,
          chatExamples: character.chatExamples,
          avatarUrl: character.avatarUrl,
          scenario: character.scenario,
          jailbreak: character.jailbreak,
          style: character.style,
          eventSequence: character.eventSequence,
          lorebooks: JSON.stringify(character.lorebooks)
        });

      if (error) {
        console.error('Failed to save character:', error);
        return { error: error.message };
      }

      return { error: null };
    } catch (error: any) {
      console.error('Character save error:', error);
      return { error: error.message };
    }
  },

  async loadCharacters(userId: string): Promise<{ characters: Character[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('characters')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to load characters:', error);
        return { characters: [], error: error.message };
      }

      const characters: Character[] = (data || []).map((row: any) => ({
        id: row.id,
        name: row.name,
        tagline: row.tagline,
        description: row.description,
        appearance: row.appearance,
        personality: row.personality,
        firstMessage: row.firstMessage,
        chatExamples: row.chatExamples,
        avatarUrl: row.avatarUrl,
        scenario: row.scenario,
        jailbreak: row.jailbreak,
        style: row.style,
        eventSequence: row.eventSequence,
        lorebooks: Array.isArray(row.lorebooks) ? row.lorebooks : (row.lorebooks ? JSON.parse(row.lorebooks) : [])
      }));

      return { characters, error: null };
    } catch (error: any) {
      console.error('Character load error:', error);
      return { characters: [], error: error.message };
    }
  },

  async deleteCharacter(characterId: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from('characters')
        .delete()
        .eq('id', characterId);

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  // Chat Sessions
  async saveChatSession(userId: string, session: ChatSession, characterId: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from('chat_sessions')
        .upsert({
          id: session.id,
          user_id: userId,
          character_id: characterId,
          name: session.name || `Chat - ${new Date().toLocaleDateString()}`,
          summary: session.summary,
          lastSummarizedMessageId: session.lastSummarizedMessageId
        });

      if (error) {
        console.error('Failed to save session:', error);
        return { error: error.message };
      }

      return { error: null };
    } catch (error: any) {
      console.error('Session save error:', error);
      return { error: error.message };
    }
  },

  async loadChatSessions(userId: string, characterId: string): Promise<{ sessions: ChatSession[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('character_id', characterId)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Failed to load sessions:', error);
        return { sessions: [], error: error.message };
      }

      const sessions: ChatSession[] = (data || []).map((row: any) => ({
        id: row.id,
        name: row.name,
        messages: [],
        summary: row.summary,
        lastSummarizedMessageId: row.lastSummarizedMessageId
      }));

      return { sessions, error: null };
    } catch (error: any) {
      console.error('Session load error:', error);
      return { sessions: [], error: error.message };
    }
  },

  // Messages
  async saveMessage(userId: string, sessionId: string, message: Message): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .upsert({
          id: message.id,
          session_id: sessionId,
          user_id: userId,
          role: message.role,
          content: message.content,
          timestamp: message.timestamp
        });

      if (error) {
        console.error('Failed to save message:', error);
        return { error: error.message };
      }

      return { error: null };
    } catch (error: any) {
      console.error('Message save error:', error);
      return { error: error.message };
    }
  },

  async loadMessages(sessionId: string): Promise<{ messages: Message[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('timestamp', { ascending: true });

      if (error) {
        console.error('Failed to load messages:', error);
        return { messages: [], error: error.message };
      }

      const messages: Message[] = (data || []).map((row: any) => ({
        id: row.id,
        role: row.role as 'user' | 'model',
        content: row.content,
        timestamp: row.timestamp
      }));

      return { messages, error: null };
    } catch (error: any) {
      console.error('Message load error:', error);
      return { messages: [], error: error.message };
    }
  },

  async deleteSession(sessionId: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  // Settings
  async saveSettings(userId: string, settings: AppSettings): Promise<{ error: string | null }> {
    try {
      // Remove globalLorebooks from what we save (they're in settings global scope)
      const { globalLorebooks, ...settingsToSave } = settings as any;

      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: userId,
          settings_data: settingsToSave
        });

      if (error) {
        console.error('Failed to save settings:', error);
        return { error: error.message };
      }

      return { error: null };
    } catch (error: any) {
      console.error('Settings save error:', error);
      return { error: error.message };
    }
  },

  async loadSettings(userId: string): Promise<{ settings: Partial<AppSettings> | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('settings_data')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Failed to load settings:', error);
        return { settings: null, error: error.message };
      }

      return { settings: data?.settings_data || {}, error: null };
    } catch (error: any) {
      console.error('Settings load error:', error);
      return { settings: null, error: error.message };
    }
  }
};
