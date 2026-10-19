# 立ち絵の差し替え（PNG）

主人公の立ち絵（身支度・街・潜入の画面）は、`stand.js` がレイヤーを重ねて SVG で描いています。
各レイヤーは、同じ大きさの透過 PNG に差し替えられます。

## 画像の決まり

- キャンバス：**240 × 640 の比率**（例：720 × 1920 px）。すべての画像で同じ大きさ・同じ位置合わせにする
- 背景は透過。正面を向いた立ちポーズで、全パーツの位置がそろっていること
- 権利に問題のない絵を使うこと

## レイヤーと重なり順（下から）

| キー | 内容 |
| --- | --- |
| `hairBack/<髪型>/<髪色>` | 後ろ髪（髪型：long / twin / pony / bob、髪色：pink / blonde / silver / black / aqua / purple / red） |
| `base` | 素体（肌・首・腕・脚） |
| `body/<服>` | 服（maid / hoodie / suit / lolita / leather / dress / kimono / garcon / kappo / patissier / gown） |
| `face` | 顔（目・口・頬） |
| `hairFront/<髪型>/<髪色>` | 前髪 |
| `face/<ID>` | 顔の小物（glasses / sunglasses / mustache / monocle） |
| `head/<ID>` | 頭の小物（beret / cap / starcap / fedora / tiara / ribbon）。何も着けないメイド服のときは `head/none-maid`（ヘッドドレス） |
| `item/<ID>` | 手に持つ物（newspaper / plush / bouquet / guitar / bag） |

## 登録のしかた

画像をこのフォルダに置き、`stand.js` の `STAND_ASSETS` に登録します。登録していないレイヤーは今までどおり SVG で描かれるので、少しずつ差し替えられます。

```js
const STAND_ASSETS = {
  'base': 'assets/stand/base.png',
  'body/maid': 'assets/stand/body/maid.png',
  'hairBack/long/pink': 'assets/stand/hairBack/long-pink.png',
};
```

追加した画像は、オフラインでも表示できるよう `sw.js` の `ASSETS` にも足し、`CACHE` の番号を上げてください。
