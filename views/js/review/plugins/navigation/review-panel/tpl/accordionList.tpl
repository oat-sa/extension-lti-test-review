{{#if parts}}
<ul class="review-panel-list plain">
    {{#each parts}}
    <li class="review-panel-part collapsible{{#if active}} active{{/if}}{{#if expanded}} expanded{{/if}}" data-control="{{id}}">
        <span class="review-panel-label navigable" title="{{label}}">{{label}}<span class="collapsible-arrow"></span></span>
        <ul class="review-panel-block plain">
        {{#each sections}}
            <li class="review-panel-section collapsible{{#if active}} active{{/if}}{{#if expanded}} expanded{{/if}}" data-control="{{id}}">
                <span class="review-panel-label navigable" title="{{label}}">{{label}}<span class="collapsible-arrow"></span></span>
                <ul class="review-panel-block plain">
                {{#each items}}
                    <li class="review-panel-item navigable{{#if active}} active{{/if}}{{#if type}} item-{{type}}{{/if}}" data-control="{{id}}" data-position="{{position}}" title="{{title}}">
                        <span class="review-panel-label">{{title}}</span>
                    {{#if withScore}}
                        <span class="review-panel-score">{{#if informational}}-{{else}}{{#if maxScore}}{{score}}/{{maxScore}}{{else}}{{#if skipped}}{{score}}{{else}}-{{/if}}{{/if}}{{/if}}</span>
                    {{/if}}
                    </li>
                {{/each}}
                </ul>
            </li>
            {{/each}}
        </ul>
    </li>
    {{/each}}
</ul>
{{/if}}
