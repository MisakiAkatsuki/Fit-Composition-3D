##########
#######
###
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
###
######
#########

FC3DData = ( ->
  scriptName          = "Fit Composition 3D"
  scriptURLName       = "FitComposition3D"
  scriptVersionNumber = "2.1.0"
  scriptURLVersion    = 210
  canRunVersionNum    = 11.0
  canRunVersionC      = "CS6"

  #クロージャ
  return{
    getScriptName         : -> scriptName
    getScriptURLName      : -> scriptURLName
    getScriptVersionNumber: -> scriptVersionNumber
    getCanRunVersionNum   : -> canRunVersionNum
    getCanRunVersionC     : -> canRunVersionC
   }
)()

ADBE_TRANSFORM_GROUP  = "ADBE Transform Group"
ADBE_POSITION         = "ADBE Position"
ADBE_SCALE            = "ADBE Scale"
ADBE_ORIENTATION      = "ADBE Orientation"

###
起動しているAEの言語チェック
###
getLocalizedText = (str) ->
  if app.language is Language.JAPANESE
    str.jp
  else
    str.en

###
許容バージョンを渡し,実行できるか判別
###
runAEVersionCheck = (AEVersion) ->
  if parseFloat(app.version) < AEVersion.getCanRunVersionNum()
    alert "This script requires After Effects #{AEVersion.getCanRunVersionC()} or greater."
    return false
  else
    return true

###
コンポジションにアクティブカメラが存在するか確認する関数
###
hasActiveCamera = (actComp) ->
  return actComp.activeCamera?

###
コンポジションを選択しているか確認する関数
###
isCompActive = (selComp) ->
  unless(selComp and selComp instanceof CompItem)
    alert "Select Composition"
    return false
  else
    return true

###
レイヤーを選択しているか確認する関数
###
isLayerSelected = (selLayers) ->
  if selLayers.length is 0
    alert "Select Layers"
    return false
  else
    return true

entryFunc = () ->
  # アクティブカメラが存在しない場合,カメラを追加する.
  unless hasActiveCamera actComp
    actComp.layers.addCamera(FC3DData.getScriptName(), [actComp.width/2, actComp.height/2])

  for i in [0...selLayers.length] by 1
    # 対象のレイヤーがカメラかライトの場合は除外する
    continue if selLayers[i] instanceof CameraLayer or selLayers[i] instanceof LightLayer

    selLayers[i].threeDLayer = true

    selLayers[i].property(ADBE_TRANSFORM_GROUP).property(ADBE_POSITION).expression =
      "thisComp.activeCamera.transform.pointOfInterest;"

    selLayers[i].property(ADBE_TRANSFORM_GROUP).property(ADBE_SCALE).expression =
      """
      var actCam = thisComp.activeCamera;
      var camPointOfInterest = actCam.transform.pointOfInterest;
      var camPosition = actCam.transform.position;
      var camZoom = actCam.cameraOption.zoom;

      x = Math.abs(camPointOfInterest[0] - camPosition[0]);
      y = Math.abs(camPointOfInterest[1] - camPosition[1]);
      z = Math.abs(camPointOfInterest[2] - camPosition[2]);

      range = Math.sqrt((x*x + y*y + z*z));
      thisScale = range / camZoom * 100;

      [thisScale, thisScale, thisScale]
      """

    selLayers[i].property(ADBE_TRANSFORM_GROUP).property(ADBE_ORIENTATION).expression =
      "transform.orientation + thisComp.activeCamera.transform.orientation;"

    selLayers[i].autoOrient = AutoOrientType.CAMERA_OR_POINT_OF_INTEREST
  return 0

undoEntryFunc = (data) ->
  app.beginUndoGroup data.getScriptName()
  entryFunc()
  app.endUndoGroup()
  return 0

###
メイン処理開始
###
return 0 unless runAEVersionCheck FC3DData

actComp = app.project.activeItem
return 0 unless isCompActive actComp

selLayers = actComp.selectedLayers
return 0 unless isLayerSelected selLayers

undoEntryFunc FC3DData
return 0
