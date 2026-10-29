import { Component } from "react";
import PropTypes from "prop-types";

import { ErrorScreen } from "./ErrorScreen";
import i18n from "../i18n";

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
        <ErrorScreen message={i18n.t("errorPage.unexpectedReload")} />
      );
    }

    return this.props.children;
  }
}

AppErrorBoundary.propTypes = {
  children: PropTypes.node,
};
