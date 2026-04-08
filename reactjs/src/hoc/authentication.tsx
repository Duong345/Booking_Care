import type { ComponentType } from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

interface RootState {
  user: {
    isLoggedIn: boolean;
  };
}

const useIsLoggedIn = (): boolean => {
  return useSelector((state: RootState) => state.user.isLoggedIn);
};

export const userIsAuthenticated = <P extends object>(
  WrappedComponent: ComponentType<P>
): ComponentType<P> => {
  const AuthenticatedComponent = (props: P) => {
    const isLoggedIn = useIsLoggedIn();

    if (!isLoggedIn) {
      return <Navigate to="/login" replace />;
    }

    return <WrappedComponent {...props} />;
  };

  return AuthenticatedComponent;
};

export const userIsNotAuthenticated = <P extends object>(
  WrappedComponent: ComponentType<P>
): ComponentType<P> => {
  const NotAuthenticatedComponent = (props: P) => {
    const isLoggedIn = useIsLoggedIn();

    if (isLoggedIn) {
      return <Navigate to="/" replace />;
    }

    return <WrappedComponent {...props} />;
  };

  return NotAuthenticatedComponent;
};
