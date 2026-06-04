import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View className="flex-1 items-center justify-center bg-background px-8">
          <View className="items-center">
            <Ionicons
              name="warning-outline"
              size={64}
              color="#EF4444"
            />
            <Text className="mt-6 text-2xl font-bold text-text">
              Something went wrong
            </Text>
            <Text className="mt-3 text-center text-base text-text-secondary">
              An unexpected error occurred. Please try again.
            </Text>
            {__DEV__ && this.state.error && (
              <Text className="mt-4 rounded-lg bg-surface-elevated p-3 text-xs text-error">
                {this.state.error.message}
              </Text>
            )}
            <Pressable
              onPress={this.handleReset}
              className="mt-8 rounded-btn bg-primary px-8 py-3 active:opacity-80"
            >
              <Text className="text-base font-semibold text-white">
                Try Again
              </Text>
            </Pressable>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}
