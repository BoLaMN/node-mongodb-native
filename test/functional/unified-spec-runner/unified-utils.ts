import { expect } from 'chai';
import type { CollectionOrDatabaseOptions, RunOnRequirement } from './schema';
import type { TestConfiguration } from './runner';
import { gte as semverGte, lte as semverLte } from 'semver';
import { CollectionOptions, DbOptions } from '../../../src';
import { isDeepStrictEqual } from 'util';

const ENABLE_UNIFIED_TEST_LOGGING = false;
export function log(message: unknown, ...optionalParameters: unknown[]): void {
  if (ENABLE_UNIFIED_TEST_LOGGING) console.warn(message, ...optionalParameters);
}

export function topologySatisfies(config: TestConfiguration, r: RunOnRequirement): boolean {
  let ok = true;
  if (r.minServerVersion) {
    const minVersion = patchVersion(r.minServerVersion);
    ok &&= semverGte(config.version, minVersion);
  }
  if (r.maxServerVersion) {
    const maxVersion = patchVersion(r.maxServerVersion);
    ok &&= semverLte(config.version, maxVersion);
  }

  if (r.topologies) {
    const topologyType = {
      Single: 'single',
      ReplicaSetNoPrimary: 'replicaset',
      ReplicaSetWithPrimary: 'replicaset',
      Sharded: 'sharded'
    }[config.topologyType];
    if (!topologyType) throw new Error(`Topology undiscovered: ${config.topologyType}`);
    ok &&= r.topologies.includes(topologyType);
  }

  if (r.serverParameters) {
    if (!config.parameters) throw new Error('Configuration does not have server parameters');
    for (const [name, value] of Object.entries(r.serverParameters)) {
      if (name in config.parameters) {
        ok &&= isDeepStrictEqual(config.parameters[name], value);
      }
    }
  }

  return ok;
}

/** Turns two lists into a joined list of tuples. Uses longer array length */
export function* zip<T = unknown, U = unknown>(
  iter1: T[],
  iter2: U[]
): Generator<[T | undefined, U | undefined], void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const longerArrayLength = Math.max(iter1.length, iter2.length);
  for (let index = 0; index < longerArrayLength; index++) {
    yield [iter1[index], iter2[index]];
  }
}

/** Correct schema version to be semver compliant */
export function patchVersion(version: string): string {
  expect(version).to.be.a('string');
  const [major, minor, patch] = version.split('.');
  return `${major}.${minor ?? 0}.${patch ?? 0}`;
}

export function patchDbOptions(options: CollectionOrDatabaseOptions): DbOptions {
  // TODO
  return { ...options } as DbOptions;
}

export function patchCollectionOptions(options: CollectionOrDatabaseOptions): CollectionOptions {
  // TODO
  return { ...options } as CollectionOptions;
}
