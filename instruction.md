# Инструкция по работе с Fashion App

## 1. Запуск приложения

### Фронтенд:

```bash
npm run dev -- --host
```

### Бэкенд:

```bash
cd /Users/admin/fashion-app/
npm run dev:server
```

---

## 2. Обновление номеров коллекций

**Файл:** `/Users/admin/fashion-app/src/constants/collectionNumber.js`

### Что делать:

1. Посмотрите, сколько коллекций добавили
2. Обновите параметры:

```javascript
totalCollections: 22,        // <- увеличить на 1 (например: 22 → 23)
layersPerCollection: 3,      // <- НЕ ТРОГАТЬ
newCollections: [22],        // <- поменять на новый номер (например: [23])
                             // ТОЛЬКО если 3+ наряда
                             // Если 6 нарядов = указать оба номера
```

### Примеры:

**Добавили 1 коллекцию (3 наряда):**

```javascript
totalCollections: 23,
layersPerCollection: 3,
newCollections: [23],
```

**Добавили 2 коллекции (6 нарядов):**

```javascript
totalCollections: 24,
layersPerCollection: 3,
newCollections: [23, 24],
```

---

## 3. Добавление контента через сервер

1. Открыть CRUD интерфейс на сервере
2. Добавить фотографии
3. Обновить файл цен:
   - `price-winter.json` (или другой сезон)

---

## Чеклист перед запуском:

- [ ] Фронт запущен
- [ ] Бэк запущен
- [ ] `collectionNumber.js` обновлен
- [ ] Фото добавлены через CRUD
- [ ] JSON с ценами обновлен

---

**Важно:**

- `newCollections` меняется ТОЛЬКО если в коллекции 3+ наряда
- Если нарядов меньше 3 — не добавляем в `newCollections`
