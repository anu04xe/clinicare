import 'package:drift/native.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:clinicare/database/database.dart';

void main() {
  test('in-memory database can be opened and queried', () async {
    final database = AppDatabase(NativeDatabase.memory());
    addTearDown(database.close);

    final rows = await database.customSelect('SELECT 1 AS value').get();

    expect(rows, hasLength(1));
    expect(rows.single.read<int>('value'), 1);
  });
}
