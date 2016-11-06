// Generated by CoffeeScript 1.10.0

/*
  Fit Composition 3D
    (C) あかつきみさき(みくちぃP)

  このスクリプトについて
    3Dレイヤーをアクティブカメラを使用して,コンポジションサイズにフィットするようにリサイズします.

  使用方法
    1.ファイル→スクリプト→スクリプトファイルの実行から実行.

  動作環境
    Adobe After Effects CS6以上

  ライセンス
    MIT License

  バージョン情報
    2016/11/05 Ver 2.1.0 Update
      対応バージョンの変更.

    2014/01/06 Ver 2.0.0 Update
      使用するカメラをアクティブカメラにした.
      複数のレイヤーに同時に適用できるようにした.
      プロパティへのアクセスをmatchNameにした.
      アクティブカメラが存在しない場合は,新規にカメラを追加するようにした.
      内部処理の見直し.
      CCの正式対応.

    2013/01/21 Ver 1.5.0 Update
      自動方向設定の追加. Undo処理の追加. 無名関数化.
      対応バージョンの変更. 内部処理の見直し.

    2012/08/21 Ver 1.1.0 Update
      選択レイヤーが2Dレイヤーの場合に3Dレイヤーするように変更.

    2012/07/10 Ver 1.0.0 Release
 */

(function() {
  var ADBE_ORIENTATION, ADBE_POSITION, ADBE_SCALE, ADBE_TRANSFORM_GROUP, FC3DData, actComp, entryFunc, getLocalizedText, hasActiveCamera, isCompActive, isLayerSelected, runAEVersionCheck, selLayers, undoEntryFunc;

  FC3DData = (function() {
    var canRunVersionC, canRunVersionNum, scriptName, scriptURLName, scriptURLVersion, scriptVersionNumber;
    scriptName = "Fit Composition 3D";
    scriptURLName = "FitComposition3D";
    scriptVersionNumber = "2.1.0";
    scriptURLVersion = 210;
    canRunVersionNum = 11.0;
    canRunVersionC = "CS6";
    return {
      getScriptName: function() {
        return scriptName;
      },
      getScriptURLName: function() {
        return scriptURLName;
      },
      getScriptVersionNumber: function() {
        return scriptVersionNumber;
      },
      getCanRunVersionNum: function() {
        return canRunVersionNum;
      },
      getCanRunVersionC: function() {
        return canRunVersionC;
      }
    };
  })();

  ADBE_TRANSFORM_GROUP = "ADBE Transform Group";

  ADBE_POSITION = "ADBE Position";

  ADBE_SCALE = "ADBE Scale";

  ADBE_ORIENTATION = "ADBE Orientation";


  /*
  起動しているAEの言語チェック
   */

  getLocalizedText = function(str) {
    if (app.language === Language.JAPANESE) {
      return str.jp;
    } else {
      return str.en;
    }
  };


  /*
  許容バージョンを渡し,実行できるか判別
   */

  runAEVersionCheck = function(AEVersion) {
    if (parseFloat(app.version) < AEVersion.getCanRunVersionNum()) {
      alert("This script requires After Effects " + (AEVersion.getCanRunVersionC()) + " or greater.");
      return false;
    } else {
      return true;
    }
  };


  /*
  コンポジションにアクティブカメラが存在するか確認する関数
   */

  hasActiveCamera = function(actComp) {
    return actComp.activeCamera != null;
  };


  /*
  コンポジションを選択しているか確認する関数
   */

  isCompActive = function(selComp) {
    if (!(selComp && selComp instanceof CompItem)) {
      alert("Select Composition");
      return false;
    } else {
      return true;
    }
  };


  /*
  レイヤーを選択しているか確認する関数
   */

  isLayerSelected = function(selLayers) {
    if (selLayers.length === 0) {
      alert("Select Layers");
      return false;
    } else {
      return true;
    }
  };

  entryFunc = function() {
    var i, j, ref;
    if (!hasActiveCamera(actComp)) {
      actComp.layers.addCamera(FC3DData.getScriptName(), [actComp.width / 2, actComp.height / 2]);
    }
    for (i = j = 0, ref = selLayers.length; j < ref; i = j += 1) {
      if (selLayers[i] instanceof CameraLayer || selLayers[i] instanceof LightLayer) {
        continue;
      }
      selLayers[i].threeDLayer = true;
      selLayers[i].property(ADBE_TRANSFORM_GROUP).property(ADBE_POSITION).expression = "thisComp.activeCamera.transform.pointOfInterest;";
      selLayers[i].property(ADBE_TRANSFORM_GROUP).property(ADBE_SCALE).expression = "var actCam = thisComp.activeCamera;\nvar camPointOfInterest = actCam.transform.pointOfInterest;\nvar camPosition = actCam.transform.position;\nvar camZoom = actCam.cameraOption.zoom;\n\nx = Math.abs(camPointOfInterest[0] - camPosition[0]);\ny = Math.abs(camPointOfInterest[1] - camPosition[1]);\nz = Math.abs(camPointOfInterest[2] - camPosition[2]);\n\nrange = Math.sqrt((x*x + y*y + z*z));\nthisScale = range / camZoom * 100;\n\n[thisScale, thisScale, thisScale]";
      selLayers[i].property(ADBE_TRANSFORM_GROUP).property(ADBE_ORIENTATION).expression = "transform.orientation + thisComp.activeCamera.transform.orientation;";
      selLayers[i].autoOrient = AutoOrientType.CAMERA_OR_POINT_OF_INTEREST;
    }
    return 0;
  };

  undoEntryFunc = function(data) {
    app.beginUndoGroup(data.getScriptName());
    entryFunc();
    app.endUndoGroup();
    return 0;
  };


  /*
  メイン処理開始
   */

  if (!runAEVersionCheck(FC3DData)) {
    return 0;
  }

  actComp = app.project.activeItem;

  if (!isCompActive(actComp)) {
    return 0;
  }

  selLayers = actComp.selectedLayers;

  if (!isLayerSelected(selLayers)) {
    return 0;
  }

  undoEntryFunc(FC3DData);

  return 0;

}).call(this);