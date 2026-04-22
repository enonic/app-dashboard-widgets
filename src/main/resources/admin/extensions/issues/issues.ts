import {render} from '/lib/mustache';
import {getToolUrl} from '/lib/xp/admin';
import {handleRequest} from '/helpers/static-helper';
import {getUser} from '/lib/xp/auth';
import {getProjects, getIssuesInRepo, parseDateTime, type Issue} from '/helpers/dashboard-helper';
import {Request} from '@enonic-types/core';

const baseToolUri = getToolUrl('com.enonic.app.contentstudio', 'main');

export function get(req: Request) {
  return handleRequest(req, (staticBaseUrl) => {
    const requestedShowLast = Number(req.params.showLast);
    const showLast = isFinite(requestedShowLast) ? Math.max(1, requestedShowLast) : 5;
    const view = resolve('./issues.html');
    const issues = getLastModifiedIssues(showLast, staticBaseUrl);
    const sortedByDateIssues = sortIssuesByDate(issues);

    const params = {
      issues: sortedByDateIssues.slice(0, showLast),
      stylesUri: `${staticBaseUrl}/styles/widgets/issues.css`
    };

    return {
      contentType: 'text/html',
      body: render(view, params),
    };
  });
}

const getLastModifiedIssues = (showLast: number, staticBaseUrl: string) => {
  const result = [];
  const projects = getProjects();
  const currentUser = getUser();

  projects.forEach((project) => {
    const findIssuesResult = getIssuesInRepo(`com.enonic.cms.${project.id}`, showLast, currentUser['key']);

    findIssuesResult.getIssues().forEach((issue) => {
      result.push(createIssueItem(issue, project, staticBaseUrl));
    });
  });

  return result;
}

const createIssueItem = (issue: Issue, project, staticBaseUrl: string) => {
  const modifiedDateTime = parseDateTime(issue.modifiedTime.toString());
  const modifiedText = generateModifiedText(issue, modifiedDateTime);
  const issueUrl = generateIssueUrl(issue.id, project.id);
  const projectUrl = generateProjectUrl(project.id);
  const name = generateNameWithId(issue);
  const imgUrl = generateImgUrl(issue, staticBaseUrl);
  const projectDisplayName = project.displayName;

  return {
    issue,
    name,
    dateTime: modifiedDateTime,
    modifiedText,
    issueUrl,
    projectUrl,
    imgUrl,
    projectDisplayName
  }
}

const generateIssueUrl = (id: string, project: string) => {
  return `${baseToolUri}#/${project}/issue/${id}`;
}

const generateProjectUrl = (project: string) => {
  return `${baseToolUri}#/${project}/browse`;
}

const generateModifiedText = (issue: Issue, modifiedDate: Date) => {
  const action = issue.modifier ? 'Updated' : 'Opened';
  const text = getModifiedString(modifiedDate);
  const currentUser = getUser();
  const issueUser = issue.modifier ? issue.modifier : issue.creator;

  const user = (issueUser == currentUser['key']) ? ' by me' : '';
  return `${action}${user} ${text}`;
}

// copied from DateHelper.ts
const getModifiedString = (modified: Date) => {
  const timeDiff = Math.abs(Date.now() - modified.getTime());
  const secInMs = 1000;
  const minInMs = secInMs * 60;
  const hrInMs = minInMs * 60;
  const dayInMs = hrInMs * 24;
  const monInMs = dayInMs * 31;
  const yrInMs = dayInMs * 365;

  if (timeDiff < minInMs) {
    return 'less than a minute ago';
  }

  if (timeDiff < 2 * minInMs) {
    return 'a minute ago';
  }

  if (timeDiff < hrInMs) {
    return `${divideAndFloor(timeDiff, minInMs)} minutes ago`;
  }

  if (timeDiff < 2 * hrInMs) {
    return 'over an hour ago';
  }

  if (timeDiff < dayInMs) {
    return `over ${divideAndFloor(timeDiff, hrInMs)} hours ago`;
  }

  if (timeDiff < 2 * dayInMs) {
    return 'over a day ago';
  }

  if (timeDiff < monInMs) {
    return `over ${divideAndFloor(timeDiff, dayInMs)} days ago`;
  }

  if (timeDiff < 2 * monInMs) {
    return 'over a month ago';
  }

  if (timeDiff < yrInMs) {
    return `over ${divideAndFloor(timeDiff, monInMs)} months ago`;
  }

  if (timeDiff < 2 * yrInMs) {
    return 'over a year ago';
  }

  return `over ${divideAndFloor(timeDiff, yrInMs)} years ago`;
}

const divideAndFloor = (n1, n2) => {
  return ~~(n1 / n2);
}

const generateNameWithId = (issue) => {
  return issue.title;
}

const generateImgUrl = (issue, staticBaseUrl: string) => {
  const type = issue.issueType == 'STANDARD' ? 'issue' : 'publish';

  return `${staticBaseUrl}/styles/widgets/icons/${type}.svg`;
}

const sortIssuesByDate = (items) => {
  return items.sort((item1, item2) => {
    return item2.dateTime - item1.dateTime;
  });
}
