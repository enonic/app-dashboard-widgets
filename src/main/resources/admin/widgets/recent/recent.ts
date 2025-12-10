import {render} from '/lib/mustache';
import {base64Encode} from '/lib/text-encoding';
import {assetUrl} from '/lib/enonic/asset';
import {getToolUrl} from '/lib/xp/admin';
import {getUser} from '/lib/xp/auth';
import {query, getType} from '/lib/xp/content';
import {run} from '/lib/xp/context';
import {getProjects, parseDateTime, formatDateTime} from '/helpers/dashboard-helper';
import {Request} from '@enonic-types/core';

const baseToolUri = getToolUrl('com.enonic.app.contentstudio', 'main');
const currentUser = getUser();

export function get (req: Request) {
  const showLast = req.params.showLast || 5;
  const lastModifiedItems = getLastModifiedContentInAllRepos(showLast);
  const filteredItems = filterSameItemsInOtherRepos(lastModifiedItems);
  const sortedByDateItems = sortItemsByDate(filteredItems);

  const params = {
    items: sortedByDateItems.slice(0, showLast),
    stylesUri: assetUrl({
      path: 'styles/widgets/recent.css'
    }),
  };

  const view = resolve('./recent.html');

  return {
    contentType: 'text/html',
    body: render(view, params),
  };
}

const getLastModifiedContentInAllRepos = (showLast) => {
  const result = [];
  const projects = getProjects();

  projects.forEach((project) => {
    const projectItems = getLastModifiedItemsInRepo(`com.enonic.cms.${project.id}`, showLast);

    projectItems.forEach((item) => {
      result.push(createContentItem(item, project));
    });
  });

  return result;
}

const getLastModifiedItemsInRepo = (repositoryId, count) => {
  return run(
    {
      repository: repositoryId,
      branch: 'draft'
    },
    () => {
      return getLastModifiedItems(count);
    }
  );
}

const getLastModifiedItems = (count) => {
  return query({
    start: 0,
    count: count,
    sort: 'modifiedTime DESC',
    query: `modifier = "${currentUser.key}"`
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
    if (item.project.parent) {
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
