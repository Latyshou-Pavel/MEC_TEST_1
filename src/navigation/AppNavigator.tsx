import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { FeedScreen } from "../screens/FeedScreen";
import { PostDetailScreen } from "../screens/PostDetailScreen";
import { colors, typography } from "../shared/theme/tokens";
import type { RootStackParamList } from "./types";
import { ROUTES } from "./routes";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator id="root-stack">
        <Stack.Screen
          name={ROUTES.FEED}
          component={FeedScreen}
          options={{
            headerShown: false,
            title: "Лента",
          }}
        />
        <Stack.Screen
          name={ROUTES.POST_DETAIL}
          component={PostDetailScreen}
          options={{
            title: "Публикация",
            headerBackButtonDisplayMode: "minimal",
            headerTintColor: colors.button.primary,
            headerTitleStyle: {
              fontFamily: typography.postAuthor.fontFamily,
              fontSize: typography.postAuthor.fontSize,
              fontWeight: typography.postAuthor.fontWeight,
              color: colors.text.primary,
            },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
