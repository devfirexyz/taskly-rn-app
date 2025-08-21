import { StatusBar } from "expo-status-bar";
import {
  PixelRatio,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Pressable,
  Alert,
  TextInput,
  ScrollView,
  FlatList,
  LayoutAnimation,
} from "react-native";
import { theme } from "../theme";
import { ShoppingListItem } from "../components/ShoppingListItem";
import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { getFromStorage, saveToStorage } from "../utils/storage";
import * as Haptics from "expo-haptics";

type ShoppingListItemType = {
  id: string;
  name: string;
  completedAtTimestamp?: number;
  lastUpdatedTimestamp: number;
};

// const testData = new Array(1000).fill(0).map((_, index) => ({
//   id: index.toString(),
//   name: `Item ${index + 1}`,
// }));

const storageKey = "shopping-list";

export default function App() {
  const [shoppingList, setShoppingList] = useState<ShoppingListItemType[]>([]);
  const [value, setValue] = useState("");

  useEffect(() => {
    const fetchInitial = async () => {
      const data = await getFromStorage(storageKey);
      if (data) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setShoppingList(data);
      }
    };
    fetchInitial();
  }, []);

  const handleSubmit = () => {
    if (value) {
      const newShoppingList = [
        {
          id: new Date().getTime().toString(),
          name: value,
          lastUpdatedTimestamp: new Date().getTime(),
        },
        ...shoppingList,
      ];
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setShoppingList(newShoppingList);
      saveToStorage(storageKey, newShoppingList);
      setValue("");
    } else {
      Alert.alert("Please enter a valid item");
    }
  };

  const onDelete = (id: string) => {
    const newShoppingList = shoppingList.filter((item) => item.id !== id);
    saveToStorage(storageKey, newShoppingList);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShoppingList(newShoppingList);
  };

  const handleToggleComplete = (id: string) => {
    const newShoppingList = shoppingList.map((item) => {
      if (item.id === id) {
        if (item.completedAtTimestamp) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        return {
          ...item,
          completedAtTimestamp: item.completedAtTimestamp
            ? undefined
            : new Date().getTime(),
          lastUpdatedTimestamp: new Date().getTime(),
        };
      }
      return item;
    });
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShoppingList(newShoppingList);
    saveToStorage(storageKey, newShoppingList);
  };

  return (
    <FlatList
      data={orderShoppingList(shoppingList)}
      renderItem={({ item }) => (
        <ShoppingListItem
          name={item.name}
          onDelete={() => onDelete(item.id)}
          onToggleComplete={() => handleToggleComplete(item.id)}
          isCompleted={Boolean(item.completedAtTimestamp)}
        />
      )}
      stickyHeaderIndices={[0]}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      ListEmptyComponent={() => (
        <View style={styles.listEmptyContainer}>
          <Text style={styles.emptyText}>Your shopping list is empty</Text>
        </View>
      )}
      ListHeaderComponent={
        <TextInput
          style={styles.textInput}
          placeholder="E.g. Coffee"
          value={value}
          onChangeText={setValue}
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
        />
      }
    />
  );

  // this syntax on inpyt change will re-render hence list re-render hence keyboard comes and goes
  // ListHeaderComponent={() => (
  //   <TextInput
  //     style={styles.textInput}
  //     placeholder="E.g. Coffee"
  //     value={value}
  //     onChangeText={setValue}
  //     returnKeyType="done"
  //     onSubmitEditing={handleSubmit}
  //   />
  // )}

  // return (
  //   <ScrollView
  //     style={styles.container}
  //     contentContainerStyle={styles.contentContainer}
  //     stickyHeaderIndices={[0]}
  //   >
  //     {/* <Link href="/counter" style={{ textAlign: "center", marginBottom: 18 , fontSize: 24}}>
  //       Go to Counter
  //     </Link> */}
  //     <TextInput
  //       style={styles.textInput}
  //       placeholder="E.g. Coffee"
  //       value={value}
  //       onChangeText={setValue}
  //       returnKeyType="done"
  //       onSubmitEditing={handleSubmit}
  //     />
  //     {shoppingList.map((item) => (
  //       <ShoppingListItem key={item.id} name={item.name} />
  //     ))}
  //     {/* <ShoppingListItem name="Coffee" />
  //     <ShoppingListItem name="Tea" isCompleted />
  //     <ShoppingListItem name="Milk" isCompleted /> */}

  //     {/* <StatusBar style="auto" /> */}
  //   </ScrollView>
  // );
}

function orderShoppingList(shoppingList: ShoppingListItemType[]) {
  return shoppingList.sort((item1, item2) => {
    if (item1.completedAtTimestamp && item2.completedAtTimestamp) {
      return item2.completedAtTimestamp - item1.completedAtTimestamp;
    }

    if (item1.completedAtTimestamp && !item2.completedAtTimestamp) {
      return 1;
    }

    if (!item1.completedAtTimestamp && item2.completedAtTimestamp) {
      return -1;
    }

    if (!item1.completedAtTimestamp && !item2.completedAtTimestamp) {
      return (
        (item2.lastUpdatedTimestamp ?? 0) - (item1.lastUpdatedTimestamp ?? 0)
      );
    }

    return 0;
  });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colorWhite,
    // justifyContent: "center",
    paddingHorizontal: 12,
    paddingTop: 30,
  },
  contentContainer: {
    paddingBottom: 30,
  },
  textInput: {
    borderWidth: 2,
    borderColor: theme.colorLightGrey,
    padding: 12,
    marginBottom: 12,
    backgroundColor: theme.colorWhite,
    fontSize: 18,
    borderRadius: 50,
  },
  listEmptyContainer: {
    marginVertical: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
  },
});
