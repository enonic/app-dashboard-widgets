import {render} from '/lib/mustache';
import {base64Encode} from '/lib/text-encoding';
import {getToolUrl} from '/lib/xp/admin';
import {getUser, User} from '/lib/xp/auth';
import {query, getType} from '/lib/xp/content';
import {run} from '/lib/xp/context';
import {getProjects, parseDateTime, formatDateTime} from '/helpers/dashboard-helper';
import {createWidgetRouter} from '/helpers/static-helper';
import {Request} from '@enonic-types/core';

const baseToolUri = getToolUrl('com.enonic.app.contentstudio', 'main');

const SHOW_LAST = 10;

const router = createWidgetRouter((staticBaseUrl: string) => {
  const lastModifiedItems = getLastModifiedContentInAllRepos(SHOW_LAST);
  const filteredItems = filterSameItemsInOtherRepos(lastModifiedItems);
  const sortedByDateItems = sortItemsByDate(filteredItems);

  const params = {
    items: sortedByDateItems.slice(0, SHOW_LAST),
    stylesUri: `${staticBaseUrl}/styles/widgets/recent.css`,
  };

  const view = resolve('./recent.html');

  return {
    contentType: 'text/html',
    body: render(view, params),
  };
});

export const all = (req: Request) => router.dispatch(req);

const getLastModifiedContentInAllRepos = (showLast: number) => {
  const result = [];
  const projects = getProjects();
  const currentUser: User | null = getUser();

  projects.forEach((project) => {
    const projectItems = getLastModifiedItemsInRepo(`com.enonic.cms.${project.id}`, showLast, currentUser);
    projectItems.forEach((item) => {
      result.push(createContentItem(item, project));
    });
  });

  return result;
}

const getLastModifiedItemsInRepo = (repositoryId: string, count: number, user: User) => {
  return run(
    {
      repository: repositoryId,
      branch: 'draft'
    },
    () => {
      return getLastModifiedItems(count, user);
    }
  );
}

const getLastModifiedItems = (count: number, user: User) => {
  return query({
    start: 0,
    count: count,
    sort: 'modifiedTime DESC',
    query: `modifier = "${user.key}"`
  }).hits;
}

const createContentItem = (item, project) => {
  const displayName = item.displayName || '<unnamed>';
  const dateTime = parseDateTime(item.modifiedTime);
  const formattedDateTime = formatDateTime(dateTime);
  const editUrl = generateEditUrl(item, project.id);
  const projectUrl = generateProjectUrl(project.id);
  const icon = getItemIcon(item);

  if (!project.description) {
    project.description = project.displayName;
  }

  return {
    item,
    displayName,
    dateTime,
    formattedDateTime,
    project,
    icon,
    editUrl,
    projectUrl
  };
}

const getItemIcon = (item) => {
  const contentType = getContentTypeWithIcon(item);

  if (!contentType) {
    return null;
  }

  const iconBase64 = contentType.icon ? base64Encode(contentType.icon.data) : null;
  const iconMimeType = contentType.icon ? contentType.icon.mimeType : '';

  return {
    iconBase64: iconBase64,
    iconMimeType: iconMimeType
  }
}

const getContentTypeWithIcon = (item) => {
  let contentType = getType(item.type);

  while (contentType) {
    if (contentType.icon) {
      return contentType;
    }

    contentType = contentType.superType ? getType(contentType.superType) : null;
  }

  return contentType;
}

const generateEditUrl = (item, project) => {
  return `${baseToolUri}/${project}/edit/${item._id}`;
}

const generateProjectUrl = (project) => {
  return `${baseToolUri}#/${project}/browse`;
}

const filterSameItemsInOtherRepos = (items) => {
  const result = [];

  items.forEach((item) => {
    if (item.project.parent && item.item.inherit?.indexOf('DATA') > -1) {
      const itemId = item._id;
      const parentProjectName = item.project.parent;
      const hasSameItemInParentLayer = items.some((i) => i._id === itemId && i.project.id === parentProjectName);

      if (!hasSameItemInParentLayer) {
        result.push(item);
      }
    } else {
      result.push(item);
    }
  });

  return result;
}

const sortItemsByDate = (items) => {
  return items.sort((item1, item2) => {
    return item2.dateTime - item1.dateTime;
  });
}
