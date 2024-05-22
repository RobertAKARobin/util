import { tryCatch } from '../../tryCatch.ts';

import { suite, test } from '../index.ts';
import { DB } from './db.ts';

export const specs = suite(`DB`, {},
	test(`#constructor`, ({ assert }) => {
		const db = new DB();
		assert(x => x(db.isConnected) === true);
	}),

	suite(`when connected`,
		{
			args: () => ({ db: new DB() }), // Note that each DB has the same data source, so even a "new" DB will have old data
			timing: `consecutive`,
		},

		test(`#disconnect`, ({ args, assert }) => {
			args.db.disconnect();
			assert(x => x(args.db.isConnected) === false);
			assert(x => x(tryCatch(args.db.disconnect)) instanceof Error); // eslint-disable-line @typescript-eslint/unbound-method
		}),

		test(`create and delete`, async({ args, assert, log }) => {
			const record = await args.db.create({ name: `alice` });
			assert(x => x(record.name) === `alice`);

			await assert(async x => (await x(args.db.getIds())).includes(x(record.id)));

			await assert(() => args.db.has(record.id));

			log(`can only delete once`);
			const doDelete = () => tryCatch(() => args.db.delete(record.id));
			await assert(async x => typeof (x(await doDelete())) === `undefined`);
			await assert(async x => x(await doDelete()) instanceof Error);

			const hasRecord2 = () => tryCatch(() => args.db.has(record.id));
			await assert(async x => x(await hasRecord2()) === false);

			await assert(async x => !(await x(args.db.getIds())).includes(record.id));

			const record2 = await args.db.create({ name: `bob` });
			await assert(async x => (await x(args.db.getIds())).includes(record2.id));
			assert(x => x(record.id) !== x(record2.id));
		}),

		test(`update`, async $ => {
			const name = `<
			this is long
>`;
			await $.args.db.create({ name });
			const recordIds = await $.args.db.getIds();
			$.assert(x => x(recordIds.length) === 2);

			const recordId = recordIds[recordIds.length - 1];
			await $.assert(async x => x((await $.args.db.get(recordId)).name) === x(`<
			this is long
>`));
			await $.assert(async x => x((await $.args.db.get(recordId)).name) === x(`<
			THIS IS LONG
>`));
		}),
	),
);



export const expected = `
———
  s1 X DB
  s1t1 • #constructor
• s1t1a1 • (db.isConnected)===true
  s1s2 X when connected
  s1s2t1 • #disconnect
• s1s2t1a1 • (args.db.isConnected)===false
• s1s2t1a2 • (tryCatch(args.db.disconnect))instanceof Error
  s1s2t2 • create and delete
• s1s2t2a1 • (record.name)===\`alice\`
• s1s2t2a2 • (await (args.db.getIds())).includes((record.id))
• s1s2t2a3 • args.db.has(record.id)
  s1s2t2#  can only delete once
• s1s2t2a4 • typeof (await doDelete())===\`undefined\`
• s1s2t2a5 • (await doDelete())instanceof Error
• s1s2t2a6 • (await hasRecord2())===false
• s1s2t2a7 • !(await (args.db.getIds())).includes(record.id)
• s1s2t2a8 • (await (args.db.getIds())).includes(record2.id)
• s1s2t2a9 • (record.id)!==(record2.id)
  s1s2t3 X update
• s1s2t3a1 • (recordIds.length)===2
• s1s2t3a2 • ((await $.args.db.get(recordId)).name)===(\`<...
X s1s2t3a3 X ((await $.args.db.get(recordId)).name)===(\`<...
             (
              <
              			this is long
              >
             )===(
              <
              			THIS IS LONG
              >
             )
Total completed assertions: 15
   0 deferred
• 14 pass
X  1 fail
RESULT: FAIL
———
`;
