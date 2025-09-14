import { writable, derived } from "svelte/store";

import type { User } from "$lib/types";
import apiUser from "$lib/user/api";

export const userQuery = createUserQuery();

export const userStatus = derived<
  typeof userQuery,
  {
    isLoading: boolean;
    isSuccess?: boolean;
    isError?: boolean;
  }
>(userQuery, ($userQuery, set) => {
  set({ isLoading: true });
  $userQuery
    .then(() => set({ isLoading: false, isSuccess: true }))
    .catch(() => set({ isLoading: false, isError: true }));
});

export const user = derived<typeof userQuery, User>(
  userQuery,
  ($userQuery, set) => {
    $userQuery.then(set).catch(() => set(null));
  }
);

function createUserQuery() {
  const { subscribe, set } = writable<Promise<User>>(apiUser.authenticate());

  const setAndReturnPromise = createSetAndReturnPromise(set);

  return {
    subscribe,

    set: (value: User) => setAndReturnPromise(Promise.resolve(value)),

    login: (mail: string, password: string) =>
      setAndReturnPromise(apiUser.login(mail, password)),

    register: (name: string, mail: string, password: string) =>
      setAndReturnPromise(apiUser.register(name, mail, password)),

    logout: () => setAndReturnPromise(apiUser.logout()),

    update: (newValue: Partial<User>) =>
      setAndReturnPromise(apiUser.update(newValue)),

    sendResetPwd: (mail: string) =>
      setAndReturnPromise(apiUser.sendResetPassword(mail)),
    resetPwd: apiUser.resetPassword,
    sendValidationMail: apiUser.sendValidationMail,
    validMail: apiUser.validMail,

    changePassword: (oldPassword: string, newPassword: string) =>
      apiUser.changePassword(oldPassword, newPassword),
  };
}

function createSetAndReturnPromise(
  set: (this: void, value: Promise<User>) => void
) {
  return (promise: Promise<User>) => {
    set(promise);
    return promise;
  };
}
