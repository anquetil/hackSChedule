import React from 'react';

import UserEnterPinModal from './UserEnterPinModal';
import UserNotFoundModal from './UserNotFoundModal';
import UserPaymentModal from './UserPaymentModal';

import api from '../../utils/api-interface';

const ModalConductor = props => {
	switch (props.currentModal) {
		case ModalStates.USER_NOT_FOUND:
			return <UserNotFoundModal {...props} />;

		case ModalStates.USER_ENTER_PIN:
			return <UserEnterPinModal {...props} />;

		case ModalStates.USER_PAYMENT:
			return <UserPaymentModal {...props} />;

		default: return null;
	}
}

const ModalStates = {
	USER_NOT_FOUND: 0,
	USER_ENTER_PIN: 1,
	USER_PAYMENT: 2
};

export default ModalConductor;
export { ModalStates };
