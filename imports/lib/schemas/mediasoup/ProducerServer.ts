import * as t from 'io-ts';
import SimpleSchema from 'simpl-schema';
import { BaseCodec, BaseOverrides } from '../Base';
import { Overrides, inheritSchema, buildSchema } from '../typedSchemas';

const ProducerServerFields = t.type({
  createdServer: t.string,
  call: t.string,
  peer: t.string,
  transport: t.string,
  producerClient: t.string,
  trackId: t.string, // client-generated GUID
  producerId: t.string,
});

const ProducerServerFieldsOverrides: Overrides<t.TypeOf<typeof ProducerServerFields>> = {
  createdServer: {
    regEx: SimpleSchema.RegEx.Id,
    denyUpdate: true,
  },
  call: {
    regEx: SimpleSchema.RegEx.Id,
    denyUpdate: true,
  },
  peer: {
    regEx: SimpleSchema.RegEx.Id,
    denyUpdate: true,
  },
  transport: {
    regEx: SimpleSchema.RegEx.Id,
    denyUpdate: true,
  },
  producerClient: {
    regEx: SimpleSchema.RegEx.Id,
    denyUpdate: true,
  },
  trackId: {
    regEx: /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i,
    denyUpdate: true,
  },
  producerId: {
    regEx: /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i,
    denyUpdate: true,
  },
};

const [ProducerServerCodec, ProducerServerOverrides] = inheritSchema(
  BaseCodec,
  ProducerServerFields,
  BaseOverrides,
  ProducerServerFieldsOverrides,
);

export { ProducerServerCodec };
export type ProducerServerType = t.TypeOf<typeof ProducerServerCodec>;

export default buildSchema(ProducerServerCodec, ProducerServerOverrides);