<ul class="review-panel-list plain">
{{#each parts}}
    <li class="review-panel-part{{#if active}} active{{/if}}{{#if expanded}} expanded{{/if}}" data-control="{{id}}">
        <span class="review-panel-label" title="{{label}}">{{label}}</span>
        <ul class="review-panel-block plain">
        {{#each sections}}
            <li class="review-panel-section{{#if active}} active{{/if}}{{#if expanded}} expanded{{/if}}" data-control="{{id}}">
                <span class="review-panel-label" title="{{label}}">{{label}}</span>
                <ul class="review-panel-block plain">
                {{#each items}}
                    <li class="review-panel-item {{cls}}" data-control="{{id}}" data-position="{{position}}" title="{{label}}">
                        <span class="review-panel-label">{{label}}</span>
                        <span class="review-panel-score">{{#if maxScore}}{{score}}/{{maxScore}}{{else}}-{{/if}}</span>
                    </li>
                {{/each}}
                </ul>
            </li>
            {{/each}}
        </ul>
    </li>
{{/each}}
</ul>
