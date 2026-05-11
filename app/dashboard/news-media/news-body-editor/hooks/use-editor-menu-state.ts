"use client";

import { useState } from "react";
import type {
  OpenCellPropertiesMenu,
  OpenImageBubbleSubmenu,
  OpenMenu,
  OpenTableBubbleSubmenu,
} from "../types";

export function useEditorMenuState() {
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);
  const [openTableBubbleSubmenu, setOpenTableBubbleSubmenu] =
    useState<OpenTableBubbleSubmenu>(null);
  const [openCellPropertiesMenu, setOpenCellPropertiesMenu] =
    useState<OpenCellPropertiesMenu>(null);
  const [openImageBubbleSubmenu, setOpenImageBubbleSubmenu] =
    useState<OpenImageBubbleSubmenu>(null);
  const [isImageAltEditorOpen, setIsImageAltEditorOpen] = useState(false);

  function closeMenu() {
    setOpenMenu(null);
  }

  function toggleMenu(menu: Exclude<OpenMenu, null>) {
    setOpenMenu((currentMenu) => (currentMenu === menu ? null : menu));
  }

  function closeImageBubbleSubmenu() {
    setOpenImageBubbleSubmenu(null);
  }

  function toggleImageBubbleSubmenu(
    menu: Exclude<OpenImageBubbleSubmenu, null>,
  ) {
    setIsImageAltEditorOpen(false);
    setOpenImageBubbleSubmenu((currentMenu) =>
      currentMenu === menu ? null : menu,
    );
  }

  function toggleTableBubbleSubmenu(
    menu: Exclude<OpenTableBubbleSubmenu, null>,
  ) {
    setOpenCellPropertiesMenu(null);
    setOpenTableBubbleSubmenu((currentMenu) =>
      currentMenu === menu ? null : menu,
    );
  }

  function closeTableBubbleSubmenu() {
    setOpenCellPropertiesMenu(null);
    setOpenTableBubbleSubmenu(null);
  }

  function openCellPropertiesView() {
    setOpenCellPropertiesMenu(null);
    setOpenTableBubbleSubmenu("cell-properties");
  }

  function closeCellPropertiesView() {
    setOpenCellPropertiesMenu(null);
    setOpenTableBubbleSubmenu(null);
  }

  function toggleCellPropertiesMenu(
    menu: Exclude<OpenCellPropertiesMenu, null>,
  ) {
    setOpenCellPropertiesMenu((currentMenu) =>
      currentMenu === menu ? null : menu,
    );
  }

  function closeAllMenus() {
    setOpenMenu(null);
    setOpenCellPropertiesMenu(null);
    setOpenTableBubbleSubmenu(null);
    setOpenImageBubbleSubmenu(null);
    setIsImageAltEditorOpen(false);
  }

  return {
    closeAllMenus,
    closeCellPropertiesView,
    closeImageBubbleSubmenu,
    closeMenu,
    closeTableBubbleSubmenu,
    isImageAltEditorOpen,
    openCellPropertiesMenu,
    openCellPropertiesView,
    openImageBubbleSubmenu,
    openMenu,
    openTableBubbleSubmenu,
    setIsImageAltEditorOpen,
    setOpenCellPropertiesMenu,
    setOpenImageBubbleSubmenu,
    setOpenMenu,
    setOpenTableBubbleSubmenu,
    toggleCellPropertiesMenu,
    toggleImageBubbleSubmenu,
    toggleMenu,
    toggleTableBubbleSubmenu,
  };
}
