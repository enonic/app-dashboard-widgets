const issueFetcher = __.newBean('com.app.ntnu.issues.IssueFetcher') as IssueFetcher;

import {list} from '/lib/xp/project';
import {run} from '/lib/xp/context';

interface Issue {
  id: string;
  modifiedTime: unknown;
  modifier?: string;
  title: string;
  issueType: string;
}

interface IssuesResult {
  getIssues(): Issue[];
}

interface IssueFetcher {
  list(count: number, principalKey: string | null): IssuesResult;
}

export function getIssuesInRepo (repositoryId: string, count: number, _principalKey: string): IssuesResult {
  return run(
    {
      repository: repositoryId,
      branch: 'draft'
    },
    () => issueFetcher.list(count || -1, /*principalKey || */null)
  );
}

export function getProjects(): ReturnType<typeof list> {
  const projects = list();
  const hideDefaultProject = app.config['settings.hideDefaultProject'] === 'true' || false;

  if (hideDefaultProject) {
    return projects.filter((p) => p.id !== 'default');
  }

  return projects;
}

export function parseDateTime(value: string | undefined): Date | undefined {
  if (!value) {
    return;
  }

  return makeDateFromUTCString(value);
}

// Copied from DateHelper.ts
const makeDateFromUTCString = (value: string): Date => {
  const parsedYear = Number(value.substring(0, 4));
  const parsedMonth = Number(value.substring(5, 7));
  const parsedDayOfMonth = Number(value.substring(8, 10));
  const parsedHours = Number(value.substring(11, 13));
  const parsedMinutes = Number(value.substring(14, 16));
  const parsedSeconds = Number(value.substring(17, 19));

  return new Date(Date.UTC(parsedYear, parsedMonth - 1, parsedDayOfMonth, parsedHours, parsedMinutes, parsedSeconds));
}

export function formatDateTime(date: Date | undefined): string {
  if (!date) {
    return '';
  }

  return zeroPad(date.getFullYear(), 4) +
         '-' +
         zeroPad(date.getMonth() + 1, 2) +
         '-' +
         zeroPad(date.getDate(), 2) +
         ' ' +
         zeroPad(date.getHours(), 2) +
         ':' +
         zeroPad(date.getMinutes(), 2) +
         ':' +
         zeroPad(date.getSeconds(), 2);
}

// Copied from DateTimeFormatter.ts
const zeroPad = (n: number, width: number): string => {
  const nWidth = n.toString().length;
  if (nWidth >= width) {
    return '' + n;
  }
  const neededZeroes = width - nWidth;
  let s = '';
  for (let i = 0; i < neededZeroes; i++) {
    s += '0';
  }

  return s + n;
}

