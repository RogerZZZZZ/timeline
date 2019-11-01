interface IAction {
  type: string
  payload: any
}

export class ReducersUtils<K extends IAction, T> {

  public createReducers(
    initState: T,
    reducerMap: {[x: string]: (state: T, payload: any) => T }
  ) {
    return (state: T = initState, action: K): T => {
      const reducer = reducerMap[action.type]
  
      return reducer
        ? reducer(state, action.payload)
        : state
    }
  }
}