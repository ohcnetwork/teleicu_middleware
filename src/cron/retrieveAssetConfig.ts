import type { Asset } from "@prisma/client";

import prisma from "@/lib/prisma";
import { AssetConfig } from "@/types/asset";
import { generateHeaders } from "@/utils/assetUtils";
import { careApi, hostname } from "@/utils/configs";

async function insertAsset(asset: AssetConfig) {
  return prisma.asset.upsert({
    where: {
      externalId: asset.id,
    },
    update: {
      name: asset.name,
      description: asset.description,
      ipAddress: asset.ip_address,
      port: asset.port,
      type: asset.type,
      updatedAt: new Date(),
      username: asset.username,
      password: asset.password,
    },
    create: {
      name: asset.name,
      externalId: asset.id,
      description: asset.description ?? "",
      ipAddress: asset.ip_address,
      port: asset.port,
      type: asset.type,
      updatedAt: new Date(),
      username: asset.username,
      password: asset.password,
    },
  });
}

async function deleteAsset(asset: Asset) {
  return prisma.asset.update({
    where: {
      externalId: asset.externalId,
    },
    data: {
      deleted: true,
      ipAddress: asset.ipAddress + "_deleted",
    },
  });
}

export async function retrieveAssetConfig() {
  console.log("Retrieving asset config");

  const response = await fetch(
    `${careApi}/api/v1/asset_config/?middleware_hostname=${hostname}`,
    { headers: await generateHeaders() },
  );

  if (!response.ok) {
    console.error(`Failed to fetch asset config: ${response.statusText}`);
    return null;
  }

  const data = (await response.json()) as AssetConfig[];
  console.log(`Found ${data?.length ?? 0} assets`);

  if (!data || data.length === 0) {
    return null;
  }

  const missingAssets = await prisma.asset.findMany({
    where: {
      externalId: {
        notIn: data.map((assetConfig) => String(assetConfig.id)),
      },
      deleted: false,
    },
  });

  //mark assets not in the new list as deleted
  const deleted = await Promise.all(
    missingAssets.map((asset) => deleteAsset(asset)),
  );
  console.log(`Deleted ${deleted.length} assets`);

  //upsert new assets
  const added = await Promise.all(
    data.map((assetConfig) => insertAsset(assetConfig)),
  );
  console.log(`Added ${added.length} assets`);

  return added;
}
