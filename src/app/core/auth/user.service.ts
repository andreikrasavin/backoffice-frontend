import { Injectable, computed, signal } from '@angular/core';
import { UserProfile } from '@core/models';

/**
 * Placeholder for the current user. Authentication is not wired yet, so the
 * signal stays `null` and the UI renders a guest state.
 */
@Injectable()
export class UserService {
  private readonly userState = signal<UserProfile | null>(null);

  readonly user = this.userState.asReadonly();
  readonly displayName = computed(() => this.userState()?.name ?? 'Гость');
  readonly initials = computed(() => {
    const name = this.userState()?.name;

    if (!name) {
      return '';
    }

    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  });
}
