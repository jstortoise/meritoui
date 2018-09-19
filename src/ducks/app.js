import { createAction, createReducer } from 'redux-act'
import { push } from 'react-router-redux'
import { pendingTask, begin, end } from 'react-redux-spinner'
import { notification } from 'antd'
import * as AuthAPI from 'lib/api/auth'

const REDUCER = 'app'
const NS = `@@${REDUCER}/`

const _setFrom = createAction(`${NS}SET_FROM`)
const _setLoading = createAction(`${NS}SET_LOADING`)
const _setHideLogin = createAction(`${NS}SET_HIDE_LOGIN`)

export const setUserState = createAction(`${NS}SET_USER_STATE`)
export const setUpdatingContent = createAction(`${NS}SET_UPDATING_CONTENT`)
export const setActiveDialog = createAction(`${NS}SET_ACTIVE_DIALOG`)
export const deleteDialogForm = createAction(`${NS}DELETE_DIALOG_FORM`)
export const addSubmitForm = createAction(`${NS}ADD_SUBMIT_FORM`)
export const deleteSubmitForm = createAction(`${NS}DELETE_SUBMIT_FORM`)
export const setLayoutState = createAction(`${NS}SET_LAYOUT_STATE`)

export const setLoading = isLoading => {
	const action = _setLoading(isLoading)
	action[pendingTask] = isLoading ? begin : end
	return action
}

export const resetHideLogin = () => (dispatch, getState) => {
	const state = getState()
	if (state.pendingTasks === 0 && state.app.isHideLogin) {
		dispatch(_setHideLogin(false))
	}
	return Promise.resolve()
}

export const initAuth = roles => (dispatch, getState) => {
	// Use Axios there to get User Data by Auth Token with Bearer Method Authentication

	const userRole = window.localStorage.getItem('app.Role');
	const username = window.localStorage.getItem('app.Username');

	const state = getState()

	const setUser = userState => {
		dispatch(
			setUserState({
				userState: {
					...userState,
				},
			}),
		)
		if (!roles.find(role => role === userRole)) {
			if (!(state.routing.location.pathname === '/admin/dashboard')) {
				dispatch(push('/admin/dashboard'))
			}
			return Promise.resolve(false)
		}
		return Promise.resolve(true)
	}

	if (userRole === 'administrator' || userRole === 'user') {
		return setUser({ username: username, role: userRole }, userRole)
	} else {
		const location = state.routing.location
		const from = location.pathname + location.search
		dispatch(_setFrom(from))
		dispatch(push('/login'))
		return Promise.reject()
	}
}

export async function login(username, password, dispatch) {
	// Use Axios there to get User Auth Token with Basic Method Authentication
	try {
		const result = await AuthAPI.login({ username, password })

		console.log(result);
		
		window.localStorage.setItem('app.Username', username);
		window.localStorage.setItem('app.Role', 'administrator')
		dispatch(_setHideLogin(true))
		dispatch(push('/admin/dashboard'))

		notification.open({
			type: 'success',
			message: 'You have successfully logged in!',
		});

		return true;

	} catch (err) {
		notification.open({
			type: 'error',
			message: 'Your email and password does not match!',
		})
		dispatch(push('/login'))
		dispatch(_setFrom(''))
		return false;
	}
}

export const logout = () => (dispatch, getState) => {
	dispatch(
		setUserState({
			userState: {
				email: '',
				role: '',
			},
		}),
	)
	window.localStorage.setItem('app.Authorization', '')
	window.localStorage.setItem('app.Role', '')
	dispatch(push('/login'))
}

const initialState = {
	// APP STATE
	from: '',
	isUpdatingContent: false,
	isLoading: false,
	activeDialog: '',
	dialogForms: {},
	submitForms: {},
	isHideLogin: false,

	// LAYOUT STATE
	layoutState: {
		isMenuTop: false,
		menuMobileOpened: false,
		menuCollapsed: false,
		menuShadow: true,
		themeLight: true,
		squaredBorders: false,
		borderLess: true,
		fixedWidth: false,
		settingsOpened: false,
	},

	// USER STATE
	userState: {
		email: '',
		role: '',
	},
}

export default createReducer(
	{
		[_setFrom]: (state, from) => ({ ...state, from }),
		[_setLoading]: (state, isLoading) => ({ ...state, isLoading }),
		[_setHideLogin]: (state, isHideLogin) => ({ ...state, isHideLogin }),
		[setUpdatingContent]: (state, isUpdatingContent) => ({ ...state, isUpdatingContent }),
		[setUserState]: (state, { userState }) => ({ ...state, userState }),
		[setLayoutState]: (state, param) => {
			const layoutState = { ...state.layoutState, ...param }
			const newState = { ...state, layoutState }
			window.localStorage.setItem('app.layoutState', JSON.stringify(newState.layoutState))
			return newState
		},
		[setActiveDialog]: (state, activeDialog) => {
			const result = { ...state, activeDialog }
			if (activeDialog !== '') {
				const id = activeDialog
				result.dialogForms = { ...state.dialogForms, [id]: true }
			}
			return result
		},
		[deleteDialogForm]: (state, id) => {
			const dialogForms = { ...state.dialogForms }
			delete dialogForms[id]
			return { ...state, dialogForms }
		},
		[addSubmitForm]: (state, id) => {
			const submitForms = { ...state.submitForms, [id]: true }
			return { ...state, submitForms }
		},
		[deleteSubmitForm]: (state, id) => {
			const submitForms = { ...state.submitForms }
			delete submitForms[id]
			return { ...state, submitForms }
		},
	},
	initialState,
)
