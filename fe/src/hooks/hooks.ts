import { useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from '../store/store'

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = useDispatch.withTypes<AppDispatch>() // useAppDispatch is use to dispatch actions to store
export const useAppSelector = useSelector.withTypes<RootState>() // useAppSelector is use to get state from store

// Both hooks are custom hook typed with the store types
// This way you don't have to import the types in every component
// and you can use them directly in your components