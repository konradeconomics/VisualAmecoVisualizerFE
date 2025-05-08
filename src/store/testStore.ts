import { create } from 'zustand';

interface TestState {
    message: string;
    setMessage: (newMessage: string) => void;
}

export const useTestStore = create<TestState>((set) => ({
    message: 'Hello from Zustand!',
    setMessage: (newMessage: string) => set({ message: newMessage }),
}));
