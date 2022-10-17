/* eslint-disable react-hooks/exhaustive-deps */
import { propConfig } from '../theme/styled-system';
import { useTheme } from './useTheme';
import React from 'react';
import { useNativeBaseConfig } from '../core/NativeBaseContext';
import { useResponsiveQuery } from '../utils/useResponsiveQuery';
//@ts-ignore
import stableHash from 'stable-hash';
import { resolvePropsToStyle } from './useThemeProps/resolvePropsToStyle';
import { Platform, StyleSheet } from 'react-native';
import { omitUndefined } from '../theme/tools';
import { isEmptyObj } from '../utils/isEmptyObj';

const getStyledSystemPropsAndRestProps = (props: any) => {
  const styledSystemProps: any = {};
  const restProps: any = {};

  const incomingAndThemeProps = omitUndefined(props);

  for (const key in incomingAndThemeProps) {
    if (key in propConfig) {
      styledSystemProps[key] = incomingAndThemeProps[key];
    } else {
      restProps[key] = incomingAndThemeProps[key];
    }
  }

  return { styledSystemProps, restProps };
};

export const useStyledSystemPropsResolver = ({
  style: propStyle,
  debug,
  ...props
}: any) => {
  const theme = useTheme();

  const { currentBreakpoint, config } = useNativeBaseConfig(
    'makeStyledComponent'
  );
  const strictMode = config.strictMode;

  const { getResponsiveStyles } = useResponsiveQuery();

  const { styledSystemProps, restProps } = getStyledSystemPropsAndRestProps(
    props
  );

  const { style, dataSet } = React.useMemo(() => {
    const resolvedStyle = resolvePropsToStyle(
      styledSystemProps,
      theme,
      Platform.OS,
      debug,
      currentBreakpoint,
      strictMode,
      getResponsiveStyles,
      restProps.INTERNAL_themeStyle,
      restProps.stateProps,
      restProps.INTERNAL_inlineStyle
    );
    return resolvedStyle;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // eslint-disable-next-line react-hooks/exhaustive-deps
    stableHash(styledSystemProps),
    theme,
    currentBreakpoint,
    debug,
    strictMode,
    stableHash(propStyle),
    getResponsiveStyles,
    stableHash(props),
    stableHash(restProps.stateProps),
    stableHash(restProps.INTERNAL_inlineStyle),
  ]);

  // if (process.env.NODE_ENV === "development" && debug) {
  //   /* eslint-disable-next-line */
  //   console.log("style,resprops", currentBreakpoint);
  // }
  // console.log('** use prop resolution 2', restProps);

  delete restProps.INTERNAL_themeStyle;
  restProps.dataSet = { ...restProps.dataSet, ...dataSet };

  const boxStyleSheet = StyleSheet.create({ box: style }); // StyleSheet.create(style);
  let styleSheet;

  if (!isEmptyObj(propStyle)) {
    styleSheet = [boxStyleSheet.box, propStyle];
  } else {
    styleSheet = boxStyleSheet.box;
  }

  return [styleSheet, restProps];
};
