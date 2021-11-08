#!/bin/bash

  # Directory for generated zip files
  OUT_DIR=/Users/imac.jiun/Projects/Astellas/Xospata_sc03-2021/dist

  # Directry containing _MAIN and _ADD presentation folders
  PROJECT=/Users/imac.jiun/Projects/Astellas/Xospata_sc03-2021/Xospata_sc03-2021

  # Directory to common shared
  SHARED_DIR=/Users/imac.jiun/Projects/Astellas/Xospata_sc03-2021/Xospata_sc03-2021/shared

  # Shared file name specific to the project
  SHARED=Xospata_sc03-2021_Shared

  # if folder doesn't exist make folders
  mkdir -p dist

  # Clean up old files inside output directory
  cd $OUT_DIR
  rm -r *

  # Generate zip file for shared resources
  cd $SHARED_DIR
  zip -r $OUT_DIR/$SHARED.zip . -x .DS_Store

  # Generate zip files for each slide in the presentation

cd $PROJECT
for slide in $(ls); do
  cd $slide
  zip -r $OUT_DIR/$slide.zip . -x .DS_Store
  cd ..
done


