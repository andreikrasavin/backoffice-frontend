import { Injectable, Provider, computed, inject, signal } from '@angular/core';
import { TokenStorage } from './token-storage';
import { UserService } from './user.service';

@Injectable()
export class AuthService {
  private readonly storage = inject(TokenStorage);

  readonly token = signal<string | null>(this.storage.get());
  readonly isAuthenticated = computed(() => this.token() !== null);

  login(token: string): void {
    this.storage.set(token);
    this.token.set(token);
  }

  logout(): void {
    this.storage.clear();
    this.token.set(null);
  }
}

export function provideAuth(): Provider[] {
  return [AuthService, TokenStorage, UserService];
}
