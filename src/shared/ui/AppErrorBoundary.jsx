import { Component } from "react";
import PropTypes from "prop-types";

import { ErrorScreen } from "./ErrorScreen";

export class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);

    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Unhandled render error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorScreen
          title="Что-то пошло не так"
          message="Произошла непредвиденная ошибка. Обновите страницу или попробуйте позже."
        />
      );
    }

    return this.props.children;
  }
}

AppErrorBoundary.propTypes = {
  children: PropTypes.node,
};
