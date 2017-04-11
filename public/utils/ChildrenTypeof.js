import React, { Children } from 'react';

const ChildrenTypeof = (Type) => {

	function validator(props, propName, componentName) {
	    const prop = props[propName];

	    let error = null;
	    Children.forEach(prop, function (child) {
	      if (child.type !== Type) {
					let errorMessage = '`' + componentName + '` children should be of type `' + Type.name + '`.';
	        error = new Error(errorMessage);
				}
	    })
	    return error;
	  }

	return validator;
}

export default ChildrenTypeof;
