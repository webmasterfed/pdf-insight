import type { ApiErrorCode } from '../../supabase/functions/_shared/api.ts';

// Errors that only the browser can detect, in addition to the codes returned by the API.
export type ClientErrorCode =
  | ApiErrorCode
  | 'config_missing'
  | 'text_too_long'
  | 'network_error'
  | 'timeout'
  | 'invalid_response';

// A Record over the union type: TypeScript fails the build if any code has no message.
export const ERROR_MESSAGES: Record<ClientErrorCode, string> = {
  origin_not_allowed: 'Ta strona nie ma dostępu do usługi analizy.',
  method_not_allowed: 'Nieprawidłowe zapytanie do usługi analizy.',
  payload_too_large: 'Dokument jest zbyt duży, aby go przeanalizować.',
  invalid_request: 'Nie udało się przygotować dokumentu do analizy.',
  rate_limited: 'Wysłano zbyt wiele zapytań. Odczekaj kilka minut i spróbuj ponownie.',
  ai_invalid_response:
    'AI zwróciło odpowiedź w nieprawidłowym formacie (również po ponownej próbie). Spróbuj ponownie.',
  ai_unavailable: 'Usługa AI jest chwilowo niedostępna. Spróbuj ponownie za chwilę.',
  ai_timeout: 'Analiza trwała zbyt długo. Spróbuj ponownie.',
  internal_error: 'Wystąpił błąd serwera. Spróbuj ponownie później.',
  config_missing: 'Aplikacja nie jest poprawnie skonfigurowana (brak adresu API).',
  text_too_long: 'Dokument zawiera zbyt dużo tekstu, aby go przeanalizować.',
  network_error: 'Brak połączenia z usługą analizy. Sprawdź połączenie z internetem.',
  timeout: 'Przekroczono czas oczekiwania na odpowiedź. Spróbuj ponownie.',
  invalid_response: 'Otrzymano nieprawidłowe dane z usługi analizy. Spróbuj ponownie.',
};
