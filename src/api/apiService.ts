import { IIntegration, IStepProps } from '../types';
import request from './request';

const apiVersion = '/v1';

/**
 * Returns a list of all capabilities, including all
 * domain-specific languages (DSLs)
 * Returns { dsls: { [val: string]: string }[] }
 */
export async function fetchCapabilities() {
  try {
    const resp = await request.get({
      endpoint: `${apiVersion}/capabilities`,
      contentType: 'application/json',
    });

    return await resp.json();
  } catch (err) {
    return err;
  }
}

/**
 * Fetch all Catalog Steps, optionally with specified query params
 * @param queryParams
 */
export async function fetchCatalogSteps(queryParams?: {
  // e.g. 'KameletBinding'
  dsl?: string;
  // e.g. 'Kamelet'
  kind?: string;
  // e.g. 'START', 'END', 'MIDDLE'
  type?: string;
}) {
  try {
    const resp = await request.get({
      endpoint: `${apiVersion}/steps`,
      queryParams,
    });

    return await resp.json();
  } catch (err) {
    console.error(err);
    return err;
  }
}

/**
 * Given the list of steps, returns the list of potential
 * DSLs compatible with said list. This is an idempotent operation.
 */
export async function fetchCompatibleDSLs(props: { steps: IStepProps[] }) {
  try {
    const resp = await request.post({
      endpoint: `${apiVersion}/integrations/dsls`,
      contentType: 'application/json',
      body: props.steps,
    });

    return await resp.json();
  } catch (err) {
    return err;
  }
}

/**
 * Fetches a single deployment CRD, optionally for a specific namespace
 * @param integrationName
 * @param namespace
 */
export async function fetchDeployment(integrationName: string, namespace?: string) {
  let URL = `${apiVersion}/deployment/${integrationName}`;
  if (namespace) URL = `${apiVersion}/deployments/${integrationName}?namespace=${namespace}`;
  try {
    const resp = await request.get({
      endpoint: URL,
      contentType: 'application/json',
    });

    return await resp.text();
  } catch (err) {
    return err;
  }
}

/**
 * Fetches all deployments, optionally for a specific namespace
 * @param namespace
 */
export async function fetchDeployments(namespace?: string) {
  let URL = `${apiVersion}/deployments`;
  if (namespace) URL = `${apiVersion}/deployments?namespace=${namespace}`;
  try {
    const resp = await request.get({
      endpoint: URL,
      contentType: 'application/json',
    });

    return await resp.json();
  } catch (err) {
    return err;
  }
}

/**
 * Fetches a single deployment's logs, optionally for a specific namespace and a specific number of lines
 * @param integrationName
 * @param lines
 * @param namespace
 */
export async function fetchDeploymentLogs(
  integrationName: string,
  lines?: number,
  namespace?: string
) {
  let URL = `${apiVersion}/deployment/${integrationName}`;
  if (namespace) URL = URL + `?namespace=${namespace}`;
  if (lines) URL = URL + `&lines=${lines}`;
  try {
    const resp = await request.get({
      endpoint: URL,
      contentType: 'application/json',
    });

    return await resp.text();
  } catch (err) {
    return err;
  }
}

/**
 * Returns integration in JSON, or type @IIntegration
 * Accepts YAML or steps as type IStepProps[].
 * Typically, used after updating the integration from the YAML Editor,
 * or for step replacement that requires an updated array of views.
 * YAML Custom Resource, but doesn't have to be.
 * @param data
 * @param dsl - The DSL that is being used across Kaoto
 */
export async function fetchIntegrationJson(data: string | IStepProps[], dsl: string) {
  try {
    const resp = await request.post({
      endpoint: `${apiVersion}/integrations?dsl=${dsl}`,
      contentType: typeof data === 'string' ? 'text/yaml' : 'application/json',
      body: typeof data === 'string' ? data : { steps: data },
    });

    return await resp.json();
  } catch (err) {
    console.error(err);
    return err;
  }
}

/**
 * Returns the source code as a string, typically a Custom Resource in
 * YAML, but doesn't have to be. Usually to update the Code Editor after
 * a change in the integration from the Visualization.
 * Requires a list of all new steps.
 * @param newIntegration
 * @param dsl
 */
export async function fetchIntegrationSourceCode(newIntegration: IIntegration, dsl: string) {
  try {
    const resp = await request.post({
      endpoint: `${apiVersion}/integrations?dsl=${dsl}`,
      contentType: 'application/json',
      body: newIntegration,
    });

    return await resp.text();
  } catch (err) {
    return err;
  }
}

/**
 * Returns views, or step extensions (JSON).
 * Typically, used after updating the integration from the YAML Editor,
 * or for step replacement that requires an updated array of views.
 * Accepts an integration's source code (string) or JSON.
 * @param data
 */
export async function fetchViews(data: IStepProps[]) {
  try {
    const resp = await request.post({
      endpoint: `${apiVersion}/view-definitions`,
      contentType: 'application/json',
      body: data,
    });

    return await resp.json();
  } catch (err) {
    console.error(err);
    return err;
  }
}

/**
 * Starts an integration deployment
 * @param integration
 * @param integrationName
 * @param namespace
 */
export async function startDeployment(
  integration: any,
  integrationName: string,
  namespace?: string
) {
  let URL = `${apiVersion}/deployments/${integrationName.toLowerCase()}`;
  if (namespace)
    URL = `${apiVersion}/deployments/${integrationName.toLowerCase()}&namespace=${namespace}`;
  try {
    const resp = await request.post({
      endpoint: URL,
      contentType: 'application/json',
      body: { name: integrationName.toLowerCase(), steps: integration },
    });

    return await resp.text();
  } catch (err) {
    throw err;
  }
}

/**
 * Stops an integration deployment
 * @param integrationName
 * @param namespace
 */
export async function stopDeployment(integrationName: string, namespace?: string) {
  let URL = `${apiVersion}/deployments/${integrationName.toLowerCase()}`;
  if (namespace)
    URL = `${apiVersion}/deployments/${integrationName.toLowerCase()}&namespace=${namespace}`;

  try {
    const resp = await request.delete({
      endpoint: URL,
      contentType: 'application/json',
    });

    return await resp.text();
  } catch (err) {
    throw err;
  }
}
